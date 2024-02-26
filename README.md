# pokemon red verion hebrew translation

- links to pret/pokered
- links to previous translation attempts

preamble about project architecture


## getting started

notes on installing pokered, gbc software

notes on running the front end

notes on build output

notes on making a pull request with translations


## quirks

put the @ on the same side of the text

eg

TIME@

translates to

@
ז
מ
ן

the @s are markers for the text rendering engine, not parts of language

they need to end up in the same "place on the screen"

which is to say, usually on the right side (after English text, before Hebrew)

if you put it on the wrong side, the engine will render nothing!

---

currently the translation writer only supports replacing text with the exact same number of lines, rendered in the same fashion (scrolling, wait for user input to scroll, ...)

this could be programmed to allow more flexibility in translations, but for now is a creative constraint.

---

the GHOST text for Cubone's mother in the poketower is not possible to translate except by hand

this is an edge case and I will take reasonable PRs to work around it.

the code which does this is in ./engine/battle/core.asm at line 6839 for anyone interested

---

be careful translating menus which rely on text positioning!

---

if you're not happy with the front end and want to translate by hand, the translations in Hebrew are stored backwards as left to right strings - as they are rendered left to right in the game and are therefore correct

you may be used to text rendering RTL for Hebrew, then switching for parentheses or numbers confusing you and your immigrant friends

this game doesn't have any support for RTL, so it will render everything LTR

the front end exists largely as a workaround for this

when you open the JSON file, your text editor will likely render the Hebrew RTL, and therefore it will read backwards. such is life.