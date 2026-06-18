import json
import pathlib
import time


ROOT = pathlib.Path(__file__).resolve().parents[1]
MODEL_ROOT = ROOT / "tmp-tts" / "sherpa-onnx"
MODEL_DIR = MODEL_ROOT / "matcha-icefall-zh-baker"
OUT_DIR = ROOT / "assets" / "tts" / "sherpa-onnx"

LINES = [
    ("mentor", "先看最终目标。你不是在背代码，你只是让屏幕出现 Hello World。"),
    ("mentor", "编程就是给电脑写一句它能照做的话，不是先背一堆术语。"),
    ("mentor", "电脑不会猜你的意思，所以我们要写一句非常明确的命令给它。"),
    ("mentor", "这句命令是 printf。你先把它理解成：请把一段文字显示到屏幕。"),
    ("system", "引号里面的 Hello World 是要显示的文字；分号表示这一句到这里结束。"),
    ("mentor", "这就像发快递：写好的代码是包裹，编译器检查机先确认地址和格式都对。"),
    ("system", "检查机先问三件事：认识 printf 吗，括号配对吗，最后有分号吗。"),
    ("mentor", "初学者先盯住四个位置：函数名、括号、引号里的文字、最后的分号。"),
    ("system", "如果少了右括号或分号，编译器会停下。它不是惩罚你，而是在指出哪一处没写完。"),
    ("mentor", "现在看实战演示：编辑器会先写工具箱，再写 main 主函数，最后写 printf。"),
    ("system", "点击运行后，编译器检查通过，输出区才会出现 Hello World。"),
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
    ("system", "离线语音服务未启动，已切换为内置旁白缓存。"),
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


def build_tts():
    rule_fsts = ",".join(str(MODEL_DIR / name) for name in ("phone.fst", "date.fst", "number.fst"))
    config = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            matcha=sherpa_onnx.OfflineTtsMatchaModelConfig(
                acoustic_model=str(MODEL_DIR / "model-steps-3.onnx"),
                vocoder=str(MODEL_ROOT / "vocos-22khz-univ.onnx"),
                lexicon=str(MODEL_DIR / "lexicon.txt"),
                tokens=str(MODEL_DIR / "tokens.txt"),
            ),
            provider="cpu",
            debug=False,
            num_threads=2,
        ),
        rule_fsts=rule_fsts,
        max_num_sentences=1,
    )
    if not config.validate():
        raise RuntimeError("Invalid sherpa-onnx Matcha zh-baker config")
    return sherpa_onnx.OfflineTts(config)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {"system": {}, "mentor": {}}
    jobs = []
    for role, text in LINES:
        key = cache_key(role, text)
        filename = f"{role}-{key}.wav"
        output = OUT_DIR / filename
        manifest[role][key] = f"assets/tts/sherpa-onnx/{filename}"
        if not output.exists():
            jobs.append((role, text, output, filename))
    if jobs:
        global sherpa_onnx
        import sherpa_onnx
        import soundfile as sf

        tts = build_tts()
        generation = sherpa_onnx.GenerationConfig()
        generation.speed = 1.08
        generation.silence_scale = 0.2
        for role, text, output, filename in jobs:
            started = time.time()
            audio = tts.generate(normalize_tts_pronunciation_text(text), generation)
            if len(audio.samples) == 0:
                raise RuntimeError(f"Failed to synthesize {role}: {text}")
            sf.write(output, audio.samples, audio.sample_rate, subtype="PCM_16")
            print(f"generated {filename} {output.stat().st_size} bytes in {time.time() - started:.2f}s")
    else:
        print("all Sherpa-ONNX clips already exist; skipped model load")
    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
