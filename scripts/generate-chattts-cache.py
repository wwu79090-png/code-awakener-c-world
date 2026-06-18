import json
import os
import pathlib
import sys
import time


ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "tts" / "chattts"
SPEAKER_FILE = OUT_DIR / "mentor-female-speaker.txt"

LINES = [
    ("mentor", "先看最终目标。你不是在背代码，你只是让屏幕出现 Hello World。"),
    ("mentor", "电脑不会猜你的意思，所以我们要写一句非常明确的命令给它。"),
    ("mentor", "这句命令是 printf。你先把它理解成：请把一段文字显示到屏幕。"),
    ("mentor", "引号里面的 Hello World 是要显示的文字；分号表示这一句到这里结束。"),
    ("mentor", "这就像发快递：写好的代码是包裹，编译器检查机先确认地址和格式都对。"),
    ("mentor", "检查机先问三件事：认识 printf 吗，括号配对吗，最后有分号吗。"),
    ("mentor", "初学者先盯住四个位置：函数名、括号、引号里的文字、最后的分号。"),
    ("mentor", "如果少了右括号或分号，编译器会停下。它不是惩罚你，而是在指出哪一处没写完。"),
    ("mentor", "现在看实战演示：编辑器会先写工具箱，再写 main 主函数，最后写 printf。"),
    ("mentor", "点击运行后，编译器检查通过，输出区才会出现 Hello World。"),
    ("mentor", "所以完整顺序是：写代码，编译器检查，通过后运行，屏幕显示结果。"),
    ("mentor", "现在进入实操。你只需要跟着光圈，点击运行按钮，亲眼看到结果。"),
    ("mentor", "现在进入实战演示。先别急着记代码，我们只看电脑从哪里开始、最后显示什么。"),
    ("mentor", "第一行 include 是准备工具箱。它告诉编译器：等会儿我要用屏幕输出功能。"),
    ("mentor", "int main 是程序入口。你可以把它理解成电脑开始执行的第一扇门。"),
    ("mentor", "printf 是这一关的核心动作：往屏幕打印一句话。现在只记住，它负责输出。"),
    ("mentor", "双引号里面的 Hello World，是要原样显示到屏幕上的文字，不是命令。"),
    ("mentor", "最后这个分号表示这一句说完了。少了它，编译器就会停下来提醒你。"),
    ("mentor", "代码写完了。现在只做一个动作：看发光光圈，点击运行按钮，让编译器检查并运行。"),
    ("mentor", "先看整句。它只有一个目标：让屏幕显示 Hello World。"),
    ("mentor", "printf 是函数名。函数就是已经准备好的小工具，这个工具负责输出文字。"),
    ("mentor", "左括号表示：我要开始告诉这个工具，具体输出什么内容。"),
    ("mentor", "双引号里面的 Hello World 是普通文字，会原样出现在屏幕上。"),
    ("mentor", "右括号表示：给 printf 的内容到这里结束。"),
    ("mentor", "分号表示这一句结束。听到叮声，就记住：C 语言每句命令通常要收尾。"),
    ("mentor", "连起来就是：使用 printf，把引号里的文字送到屏幕，然后用分号结束。"),
    ("mentor", "Supertonic 本地离线旁白测试"),
]


def cache_key(role, text, engine="Supertonic"):
    value = f"{engine}|{role}|{text}"
    hash_value = 2166136261
    for char in value:
        hash_value ^= ord(char)
        hash_value = (hash_value * 16777619) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    if hash_value == 0:
        return "0"
    result = ""
    while hash_value:
        hash_value, rem = divmod(hash_value, 36)
        result = digits[rem] + result
    return result


def normalize_tts_pronunciation_text(text):
    replacements = (
        ('printf("Hello World!");', "普林特艾夫，括号，引号，哈喽，沃德，引号，括号，分号"),
        ("printf", "普林特艾夫"),
        ("Hello World", "哈喽，沃德"),
        ("#include", "井号，因克鲁德"),
        ("include", "因克鲁德"),
        ("Supertonic", "苏帕托尼克"),
    )
    spoken = text
    for old, new in replacements:
        spoken = spoken.replace(old, new)
    return (
        spoken.replace("int main", "主函数")
        .replace("main", "主函数")
        .replace("int", "整数类型")
        .replace("C 语言", "西语言")
        .replace("C语言", "西语言")
        .strip()
    )


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {"mentor": {}}
    force_regenerate = "--force" in sys.argv or os.environ.get("CHAT_TTS_FORCE_REGENERATE") == "1"
    force_keys = set()
    for arg in sys.argv:
        if arg.startswith("--force-keys="):
            force_keys.update(item.strip() for item in arg.split("=", 1)[1].split(",") if item.strip())
    force_keys.update(item.strip() for item in os.environ.get("CHAT_TTS_FORCE_KEYS", "").split(",") if item.strip())
    jobs = []
    for role, text in LINES:
        key = cache_key(role, text)
        output = OUT_DIR / f"{role}-{key}.wav"
        manifest.setdefault(role, {})[key] = f"assets/tts/chattts/{output.name}"
        if force_regenerate or key in force_keys or not output.exists():
            jobs.append((role, text, output))
    if jobs:
        import ChatTTS
        import soundfile as sf

        chat = ChatTTS.Chat()
        started = time.time()
        if not chat.load(source="huggingface", compile=False):
            raise RuntimeError("ChatTTS failed to load")
        print(f"ChatTTS loaded in {time.time() - started:.2f}s")
        if SPEAKER_FILE.exists() and SPEAKER_FILE.read_text(encoding="utf-8").strip():
            speaker = SPEAKER_FILE.read_text(encoding="utf-8").strip()
        else:
            speaker = chat.sample_random_speaker()
            SPEAKER_FILE.write_text(speaker, encoding="utf-8")
        params = ChatTTS.Chat.InferCodeParams(
            prompt="[speed_4]",
            top_P=0.7,
            top_K=20,
            temperature=0.28,
            manual_seed=20260619,
            spk_emb=speaker,
        )
        for role, text, output in jobs:
            spoken = normalize_tts_pronunciation_text(text)
            started = time.time()
            wavs = chat.infer([spoken], skip_refine_text=True, params_infer_code=params)
            sf.write(output, wavs[0], 24000, subtype="PCM_16")
            print(f"generated {output.name} {output.stat().st_size} bytes in {time.time() - started:.2f}s")
    else:
        print("all ChatTTS clips already exist; skipped model load")
    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
