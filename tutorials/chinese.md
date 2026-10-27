# Speak Chinese

Make Robot PU say 你好, 谢谢, 恭喜发财 — in Mandarin! SAM only knows
English phonemes, so Chinese has to be **spelled in robot sounds**. The
result is a charming robot accent that is unmistakably Chinese.

You will need a **micro:bit V2** — a Robot PU makes the voice much
louder, but any V2 works.

## Step 1: The easy way — English-ish spelling

Just spell the Chinese word the way it sounds in English, inside
``||robotpuVoice:say||``. 你好 (nǐ hǎo, "hello") is close to
"Nee How":

```blocks
robotpuVoice.say("Nee How")
```

**Try it:** download — Robot PU says hello in Chinese. It works because
the English word *how* already sounds like 好.

## Step 2: Every character gets a syllable

Mandarin works beautifully in SAM because **every Chinese character is
exactly one syllable**. Put a space between syllables and the robot
walks through them:

```blocks
robotpuVoice.say("Nee How Mar?")
```

That's 你好吗 (*nǐ hǎo ma*) — "how are you?" The ``?`` at the end even
gives it a rising question inflection, which 吗 loves.

## Step 3: Say it with feeling

``||robotpuVoice:say||`` treats your text as English, so the
pronunciation drifts toward English words. For a firmer Chinese accent,
spell the syllables more phonetically:

```blocks
robotpuVoice.say("Heng Gou thing ren shee nee!")
```

That's 很高兴认识你 (*hěn gāo xìng rèn shi nǐ*) — "nice to meet you".
It is an approximation — and that's fine, it *should* sound like a
robot speaking Chinese.

## Step 4: The precise way — `pronounce` phonemes

``||robotpuVoice:pronounce phonemes||`` skips the English interpreter
and takes raw SAM sounds. Vowel cheat sheet — say the English word, take
the vowel:

| Sound like | Phoneme | Chinese example | Spelling |
|------------|---------|-----------------|----------|
| ee (b**ee**) | `IY` | 你 nǐ | `NIY3` |
| ah (f**a**ther) | `AA` | 吗 ma | `MAA` |
| aw (h**ow**) | `AW` | 好 hǎo | `/HAW4` |
| eh (b**e**d) | `EH` | 很 hěn | `/HEH4N` |
| oh (g**o**) | `OW` | 我 wǒ | `WOW` |
| oo (b**oo**) | `UW` | 不 bù | `BUW` |
| uh (b**u**t) | `UH` | 了 le | `LUH` |
| eye (h**i**gh) | `AY` | 爱 ài | `AA4IY` |
| ay (d**ay**) | `EY` | 诶 èi | `EY` |
| ur (h**er**) | `ER` | 儿 ér | `ER` |

And the tricky consonants:

| Pinyin letter | Nearest phoneme | Example |
|---------------|-----------------|---------|
| h | `/H` (hard H — needs the slash) | 好 `/HAW` |
| x | `SH` | 西 `SHIY`, 兴 `SHIH4NX` |
| j | `J` | 加 `JYAA4`, 见 `JYEH5N` |
| q | `CH` | 七 `CHIY`, 请 `CHIH5NX` |
| zh | `J` | 知 `JIY5` |
| ch | `CH` | 吃 `CHIY5` |
| sh | `SH` | 是 `SHIY5`, 上 `SHAHNX` |
| z, c | `TS` (T+S is fine — no single letter needed) | 在 `TSAA4IY`, 才 `TSAA4IY` |
| final -ng | `NX` | 王 `WAA5NX`, 中 `JOH5NX` |

```blocks
robotpuVoice.pronounce("NIY3 /HAW4")
```

**Try it:** crisper 你好 than the `say` version — you controlled every
sound.

## Step 5: The digit is your friend (and your enemy)

In a `pronounce` string, digits **1–8** are *stress marks*: they push a
syllable harder, which is how you fake Mandarin tones. A high stress
digit gives a punchy, descending feel — perfect for the forceful 4th
tone:

```blocks
robotpuVoice.pronounce("SHYEH4 SHYEH")
```

That's 谢谢 (*xièxie*) — stressed first syllable, light neutral second,
just like a native speaker says it.

Two warnings about digits:

- **In ``say`` a digit is read as a number** — "Nee 4" comes out "nee
  four". Stress marks only work inside ``pronounce``.
- **Letters that aren't phonemes kill the whole phrase — silently.**
  The most common trap: `I` is not a phoneme (write `IY`), and `NG`
  isn't one either (write `NX` — `NG` happens to parse as N+G which
  sounds close, but `NX` is the real "ng"). If a phrase goes quiet for
  no reason, a stray letter is usually why.

## Step 6: Make a word last — repeat the vowel

Need a syllable to ring out longer? **Repeat its vowel.** Every
repetition adds another full vowel's worth of sound, and because it's
the same phoneme the stretch is smooth — a held sound, not a stutter:

```blocks
robotpuVoice.pronounce("LUH4")       // short
robotpuVoice.pronounce("LUH4UH")     // about twice as long
robotpuVoice.pronounce("LUH4UHUH")   // longest — the finale
```

That is exactly what ``LUH4UHUH`` does at the end of 新年快乐 in
Step 9 — 乐 (*lè*, "joy") held out like the last word of a song. A stress
digit on the tail gives it a second push: ``LUH4 UH5``.

Repeating a *consonant* doesn't stretch — ``SHYEH4SHYEH4`` sounds like
two words, not one long one. Vowels hold, consonants stutter. (This is
the same trick ``sing note`` uses internally: a held note is just a
repeated vowel with a steady pitch.)

## Step 7: Your first New Year greeting

Put the pieces together — 恭喜发财 (*gōng xǐ fā cái*, "may you be
prosperous"):

```blocks
robotpuVoice.pronounce("GOH5NX SHIY3 FAA5 TSAA3IY5")
```

Broken down: `GOH5NX` 恭 (stressed, ng ending), `SHIY3` 喜,
`FAA5` 发, `TSAA3IY5` 财 — that last one is T+S for the c sound, `AA`
gliding into `IY` for the -ai rhyme.

**Try it:** listen for *gōng-shǐ-fā-tsái*. Then tune a digit or a vowel
and hear the accent shift.

## Step 8: Let the engine guess first

Not sure how to spell something? Ask the engine for its best guess —
``||robotpuVoice:phonemes for||`` converts your English-ish text to the
SAM spelling it would speak, without playing it:

```blocks
input.onButtonPressed(Button.A, function () {
    serial.writeLine(robotpuVoice.toPhonemes("nee how mar"))
})
```

Copy what it prints, then fix it by hand with the tables above — most
syllables just need a stress digit and a better vowel. (It returns an
empty string while the robot is talking, so wait for quiet first.)

## Step 9: A bilingual robot

Put on a little show — announce in English, greet in Chinese, toast in
Chinese:

```blocks
robotpuVoice.setVoice(VoicePreset.LittleRobot)
robotpuVoice.say("Hello! I can speak Chinese!")
robotpuVoice.rest(300)
robotpuVoice.say("Nee How Mar?")
robotpuVoice.rest(300)
robotpuVoice.pronounce("/HEH4N GAW5 SHIH4NX REH4N SHIY5 NIY3")
robotpuVoice.rest(300)
robotpuVoice.pronounce("WOH GAA5NX SHWEH5 JOH5NX WEH4N, CHIH4NX DWOH5 DWOH5 JIY4 JYAW4")
robotpuVoice.rest(300)
robotpuVoice.pronounce("GOH5NX SHIY3 FAA5 TSAA3IY5")
robotpuVoice.rest(300)
robotpuVoice.pronounce("SHIH4N NYEHN5 KWAA4IY LUH4UHUH")
```

Line by line: 你好吗 — 很高兴认识你 — 我刚学中文，请多多指教
(*wǒ gāng xué zhōng wén, qǐng duō duo zhǐ jiào*, "I just started
learning Chinese, please go easy on me") — 恭喜发财 — 新年快乐
(*xīn nián kuài lè*, "happy new year"). The `,` inside the phoneme
string is a real pause, right where the comma sits in the Chinese.

## Step 10: Challenges

- **More phrases** — try 谢谢 (`SHYEH4 SHYEH`), 再见 (`TSAA4IY JYEH5N`),
  我爱你 (`WOH AA4IY NIY3`), 加油 (`JYAA4 YOW5`), 欢迎
  (`/HWAAN5 YIHNX`).
- **Tune the tones** — Mandarin's 4th tone likes a high stress digit
  and a short vowel; the 1st tone likes a long steady vowel. Tune
  你好 by ear until it lands.
- **Robot accent wars** — try the same phrase in `VoicePreset.Sam`,
  `Elf`, and `Dalek`. Which makes the best Chinese?
- **Name yourself** — write your own name in phonemes with
  ``phonemes for`` plus the tables, then have Robot PU greet *you*.
