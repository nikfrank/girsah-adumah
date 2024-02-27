# pokemon red verion hebrew translation

this project serves as a translator shim for https://github.com/pret/pokered the disassembly project

it assumes that `../pokered/` is available in a next door directory

when you run `node write.js`, it will run child-processes which

 - split & check out a build branch in `../pokered/`
 - use `sed` to replace user facing strings in the `.asm` files
 - call `make` to generate a build output `.gbc` file
 - copy the build output to the build directory (in this project)
 - commit the translated `.asm` files to the build branch
 - check out the master branch `../pokered/`, returning to original state

you can then copy the `.gbc` file to `../pokered/pokered.gbc` and `vba` will use your existing save states in the newly translated copy!


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



## futureproofing

the idea of using a shim is that the core project will evolve and improve, and people may wish to render translated copies of future versions

also, there's no reason it wouldn't be possible to translate romhack alternate versions using this shim - if there are any added texts, use `node read.js` to read strings out of the assembly source to become available in the front end.

or to fork this project and use a similar technique to translate other games

### previous attempts recognition

https://github.com/Nog-Frog/pokered-girl/ has many translated strings but has not kept up with the core project from when it was forked... it also has translated images (and a girl as the main character), all of which I intend to make available in this project (imagine `node write.js --girl` to build in nekava)

https://github.com/LIJI32/pokeadom has the typewriter effect for RTL text, which I would like to merge into this project as well.

to avoid the effect running LTR on RTL text, the `./hebrew-support.patch` applied during build shortcircuits the function which plays the effect so all text appears simultaneously

my forebearers have shown wisdom and grace in leaving me space to prove myself.