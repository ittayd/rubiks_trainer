var f2l = [ /* http://www.rubiksplace.com/speedcubing/F2L-algorithms/ */
	{
		name: "Corner on top, FL color facing side, edge colors match",
		algs: [// {type: "f2l", moves: "U Slot"},
			// {type: "f2l", moves: "y' U' (Slot^) y"},
			{ type: "f2l", moves: "U' Match U2 Slot", comment: "white on right, slot opposite, white down, match, white up, slot" },
			{ type: "f2l", moves: "d Match^ U2 Slot^ y", comment: "white on right, rotate under so slot is opposite, white down, match, white up, slot in back"},
			{ type: "f2l", moves: "U' DoubleSlot U2 Slot", comment: "white on right, slot opposite, white down, match, white up, slot"  },
			{ type: "f2l", moves: "d DoubleSexy^  (Slot^) y", comment: "white on right, rotate under so slot is opposite, white down, match, white up, slot in back" },
			{ type: "f2l", moves: "y' Slot^ U' d' Match" },
			{ type: "f2l", moves: "Slot U d (Match^) y" }]
	},
	{
		name: "Corner on top, FL color facing side, edge colors opposite",
		algs: [
			// {type: "f2l", moves: "y' (Match^) y"},
			// {type: "f2l", moves: "Match"},
			{ type: "f2l", moves: "d Match^ U' (Match^) y" },
			{ type: "f2l", moves: "U' Shoot Match" },
			{ type: "f2l", moves: "U' DoubleSlot d (Match^) y" },
			{ type: "f2l", moves: "R' U2 R2 U R2' U R" },
			{ type: "f2l", moves: "d Slot^ U' (Match^) y" },
			{ type: "f2l", moves: "U' Slot U Match" }]
	},
	{
		name: "Corner on top, FL color facing up",
		algs: [
			{ type: "f2l", moves: "DoubleSlot U' Match" },
			{ type: "f2l", moves: "y' DoubleSlot^ U (Match^) y" },
			{ type: "f2l", moves: "U DoubleSlot U Slot" },
			{ type: "f2l", moves: "y' U' DoubleSlot^ U' (Slot^) y" },
			{ type: "f2l", moves: "U2 Shoot Slot" },
			{ type: "f2l", moves: "y' U2 Match^ U' (Slot^) y" },
			{ type: "f2l", moves: "y' U DoubleSlot^ y R U2 Slot^ U' R'" },
			{ type: "f2l", moves: "U' DoubleSlot y' DoubleSlot^ U' Slot^ y" }]
	},
	{
		name: "Corner down, edge on top",
		algs: [
			{ type: "f2l", moves: "U Slot d' (L' U L) y'" },
			{ type: "f2l", moves: "y' U' Slot^ r' U' R U M' y" },
			{ type: "f2l", moves: "y' Match^ U (Match^) y" },
			{ type: "f2l", moves: "Match U' Match" },
			{ type: "f2l", moves: "Slot U Slot" },
			{ type: "f2l", moves: "y' Slot^ U' (Slot^) y" }]
	},
	{
		name: "Edge down, corner on top",
		algs: [
			{ type: "f2l", moves: "U' Slot U2 Slot" },
			{ type: "f2l", moves: "d Slot^ U2 (Slot^) y" },
			{ type: "f2l", moves: "U' Match d (Match^) y" },
			{ type: "f2l", moves: "d Match^ d' Match" },
			{ type: "f2l", moves: "Slot d (Slot^) y" },
			{ type: "f2l", moves: "[Match U'] [Match U'] Match" }]
	},
	{
		name: "Corner down, edge down",
		algs: [
			{ type: "f2l", moves: "R U' Match^ U R' U2 Slot" },
			{ type: "f2l", moves: "R U DoubleSlot^ U' R' U Match" },
			{ type: "f2l", moves: "Slot d Match^ U' (Match^) y" },
			{ type: "f2l", moves: "R U Match^ U' R' U2 y' (Match^) y" },
			{ type: "f2l", moves: "Slot U y' DoubleSexy^ (Slot^) y" }]
	}
]

/*
var oll = [
	{ "type": "oll", "name": "28", "imageFileName": "oll28.gif", "moves": "(M' U M) U2 (M' U M)", "comments": "The middle slices should be done with the left ring finger for M' and the left thumb for M. The (M' U M) group may take some getting used to." },
	{ "type": "oll", "name": "57", "imageFileName": "oll57.gif", "moves": "(Match U') r (Slot^ U') r'", "comments": "There's nothing too fancy here. The finger tricks used are pretty common. I do the slice turn as M' now because I think it's a little faster that way." },
	{ "type": "oll", "name": "20", "imageFileName": "oll20.gif", "moves": "r' (R U) (Match U' r2) (R2' U) (R U') r'", "comments": "Here, I use the slice as (r' R) because it flows a little nicer. This is the least common OLL case (1/216). The finger tricks here are pretty simple." },
	{ "type": "oll", "name": "23", "imageFileName": "oll23.gif", "moves": "(R2' D) (R' U2) (R D') (R' U2 R')", "comments": "This is one of the most awkward OLLs with all correctly flipped edges. It's still pretty fast, though." },
	{ "type": "oll", "name": "24", "imageFileName": "oll24.gif", "moves": "(r U) (R' U') (r' F) (R F')", "comments": "Custom." },
	{ "type": "oll", "name": "25", "imageFileName": "oll25.gif", "moves": "F' (r U R' U') (r' F R)", "comments": "Custom. DoubleSlot fast." },
	{ "type": "oll", "name": "27", "imageFileName": "oll27.gif", "moves": "(Match U) (DoubleSlot)", "comments": "This is the Sune. Your right hand should never come off of the cube during the execution at any time." },
	{ "type": "oll", "name": "26", "imageFileName": "oll26.gif", "moves": "(R U2) (Match^ U' R')", "comments": "This is just the inverse of the Sune, called the Anti sune." },
	{ "type": "oll", "name": "22", "imageFileName": "oll22.gif", "moves": "(R U2) (R2' U') (R2 U') (R2' U2 R)", "comments": "The execution of this algorithm is pretty neat. The R2 turns should alternate in direction so that they can be performed by the right hand without letting go of the cube. The left hand holds the cube and makes the U' turns." },
	{ "type": "oll", "name": "21", "imageFileName": "oll21.gif", "moves": "L' U' L U' L' U L U' L' U2 L", "comments": "Custom. Double sune (or Anti -sune, I can never remember) with the left hand." },
	{ "type": "oll", "name": "3", "imageFileName": "oll03.gif", "moves": "f (Match U') f' U' F (Match U') F'", "comments": "This is a clever combination of the two six move OLLs." },
	{ "type": "oll", "name": "4", "imageFileName": "oll04.gif", "moves": "f (Match U') f' U F (Match U') F'", "comments": "This is another combination of the two six move OLLs." },
	{ "type": "oll", "name": "17", "imageFileName": "oll17.gif", "moves": "(Match U) (R' F R F') U2 (R' F R F')", "comments": "This one is very fast. Each of the three triggers should be lightning fast." },
	{ "type": "oll", "name": "19", "imageFileName": "oll19.gif", "moves": "r' (R U) (Match U' r) x (R2' U) (R U') x'", "comments": "This alg is the same as the &quot;X&quot; orientation (#20) except with a slight modification." },
	{ "type": "oll", "name": "18", "imageFileName": "oll18.gif", "moves": "F (Match U) y' (R' U2) (R' F R F') y", "comments": "This case has a couple of fast triggers in it." },
	{ "type": "oll", "name": "2", "imageFileName": "oll02.gif", "moves": "[F (Match U') F'] [f (Match U') f']", "comments": "This algorithm is just the easy T-orientation followed by the easy P-orientation.The S can take a little getting used to." },
	{ "type": "oll", "name": "1", "imageFileName": "oll01.gif", "moves": "(R U2) (R2' F R F') U2 (R' F R F')", "comments": "This is just (DoubleSlot) followed by a couple of sledgehammers." },
	{ "type": "oll", "name": "33", "imageFileName": "oll33.gif", "moves": "(Match U') (R' F R F')", "comments": "This orientation makes up the second half of the Y-permutation. Both triggers are lightning fast, so this should easily be sub-1 second." },
	{ "type": "oll", "name": "45", "imageFileName": "oll45.gif", "moves": "F (Match U') F'", "comments": "This is the quickest and shortest OLL case. I use the left index for the U' and the right thumb for the F'." },
	{ "type": "oll", "name": "44", "imageFileName": "oll44.gif", "moves": "f (Match U') f'", "comments": "This is very similar to the easy T orientation (#45) except with a double layer turn instead of just F. It is helpful to know the inverse to avoid a U2 before the alg." },
	{ "type": "oll", "name": "43", "imageFileName": "oll43.gif", "moves": "f' (L' U' L U) f", "comments": "This is just the mirror of OLL #44. I also recommend being able to perform this alg from a U2." },
	{ "type": "oll", "name": "32", "imageFileName": "oll32.gif", "moves": "(R d) (L' d') (R' U) (l U l')", "comments": "There should be a nice balance between both hands in performing this algorithm." },
	{ "type": "oll", "name": "31", "imageFileName": "oll31.gif", "moves": "(R' U') F (U Slot) F' R", "comments": "This is just the mirror of OLL #32, but I don't perform it as such. Instead, I do an algorithm that contains the inverse of the easy T orienation in it." },
	{ "type": "oll", "name": "38", "imageFileName": "oll38.gif", "moves": "(Match U) (Slot U') (R' F R F')", "comments": "There's nothing difficult about any of these three triggers." },
	{ "type": "oll", "name": "36", "imageFileName": "oll36.gif", "moves": "(L' U' L U') (L' U L U) (L F' L' F)", "comments": "This is just the mirror of OLL #38. You could also do U2 and perform a right handed version of this algorithm." },
	{ "type": "oll", "name": "54", "imageFileName": "oll54.gif", "moves": "(r U) (R' U) (R U') (R' U) (R U2 r')", "comments": "The left hand only holds the cube while the right does everything else. This is sort of like a fat double Sune." },
	{ "type": "oll", "name": "53", "imageFileName": "oll53.gif", "moves": "(r' U') (R U') (R' U) (R U') (R' U2 r)", "comments": "This is similar to OLL #54, but the first U' is done with the left index finger." },
	{ "type": "oll", "name": "50", "imageFileName": "oll50.gif", "moves": "(R B' R B R2') U2 (F R' F' R)", "comments": "Use the right hand to do the first set of moves all in one motion. The second trigger should be very fast." },
	{ "type": "oll", "name": "49", "imageFileName": "oll49.gif", "moves": "(R' F R' F' R2) U2 y (R' F R F') y'", "comments": "This algorithm is very similar to OLL #50 with an added cube rotation to make the second trigger easier to perform." },
	{ "type": "oll", "name": "48", "imageFileName": "oll48.gif", "moves": "F (Match U') (Match U') F'", "comments": "This is just the easy T-orientation performed twice in a row." },
	{ "type": "oll", "name": "47", "imageFileName": "oll47.gif", "moves": "F' (L' U' L U) (L' U' L U) F", "comments": "This is just the mirror of OLL #48." },
	{ "type": "oll", "name": "39", "imageFileName": "oll39.gif", "moves": "(L F') (L' U' L U) F U' L'", "comments": "The right thumb gets a lot of work done at the end of this algorithm.The first trigger can be a little tricky if you don't grip the cube properly. The end can be a bit tricky, too." },
	{ "type": "oll", "name": "40", "imageFileName": "oll40.gif", "moves": "(R' F) (Match U') F' U R", "comments": "This is just the mirror of OLL #39." },
	{ "type": "oll", "name": "34", "imageFileName": "oll34.gif", "moves": "(R U R2' U') (R' F) (R U) (R U') F'", "comments": "This case is fast. It takes a little while to get used to the R2' not being just R', but the algorithm flows very nicely. I make the last F' turn with my right index finger." },
	{ "type": "oll", "name": "46", "imageFileName": "oll46.gif", "moves": "(R' U') (R' F R F') (U R)", "comments": "There's nothing fancy here. This is just a sledgehammer with a setup move." },
	{ "type": "oll", "name": "5", "imageFileName": "oll05.gif", "moves": "(r' U2) (Shoot r)", "comments": "This is just a fat Anti sune performed from the back of the cube." },
	{ "type": "oll", "name": "6", "imageFileName": "oll06.gif", "moves": "(r U2) (Match^ U' r')", "comments": "This is just a fat Anti sune." },
	{ "type": "oll", "name": "7", "imageFileName": "oll07.gif", "moves": "(r U R' U) (R U2 r')", "comments": "This case is just the inverse of one of the squares (OLL #6)." },
	{ "type": "oll", "name": "12", "imageFileName": "oll12.gif", "moves": "[F (Match U') F'] U [F (Match U') F']", "comments": "This is just a Sune from the back right except with a setup move." },
	{ "type": "oll", "name": "8", "imageFileName": "oll08.gif", "moves": "(r' U' R U') (R' U2 r)", "comments": "Like OLL #7, this is just the inverse of one of the squares (OLL #5)." },
	{ "type": "oll", "name": "11", "imageFileName": "oll11.gif", "moves": "[F' (L' U' L U) F] y [F (Match U') F'] y'", "comments": "Like OLL #12, this is just a Sune with a setup move." },
	{ "type": "oll", "name": "37", "imageFileName": "oll37.gif", "moves": "F (R U') (Match^ U) (R' F')", "comments": "This is one of the fastest orientations. It's the first half of the Y-permutation. The last six moves are EXTREMELY FAST." },
	{ "type": "oll", "name": "35", "imageFileName": "oll35.gif", "moves": "(R U2) (R2 F) (R F' DoubleSlot)", "comments": "This is just the sledgehammer with a setup move." },
	{ "type": "oll", "name": "10", "imageFileName": "oll10.gif", "moves": "(Match U) (R' F R F') (DoubleSlot)", "comments": "This is kind of like a Sune with a sledgehammer mixed in." },
	{ "type": "oll", "name": "9", "imageFileName": "oll09.gif", "moves": "(Match U' R' F) (R2 U R' U' F')", "comments": "This is a pretty fast algorithm that flows very nicely." },
	{ "type": "oll", "name": "51", "imageFileName": "oll51.gif", "moves": "f (Match U') (Match U') f'", "comments": "This is just the easy P-orientation repeated twice." },
	{ "type": "oll", "name": "52", "imageFileName": "oll52.gif", "moves": "(R U Slot^d') (Slot F') y'", "comments": "The d' turn eliminates the need for a rotation, so this algorithm can be done very quickly." },
	{ "type": "oll", "name": "56", "imageFileName": "oll56.gif", "moves": "f (Match U') f' F (Match U') (Match U') F'", "comments": "I do this algorithm as the easy P-orientation followed by the easy T-orientation repeated twice." },
	{ "type": "oll", "name": "55", "imageFileName": "oll55.gif", "moves": "(R U2) (R2 U' Slot U2) (F R F')", "comments": "This is just a Sune performed from the back right with a setup at the beginning and a sledgehammer at the end." },
	{ "type": "oll", "name": "13", "imageFileName": "oll13.gif", "moves": "(r U' r' U' r U r' y' (Slot^) y", "comments": "I like this algorithm. I just wish it didn't have a rotation." },
	{ "type": "oll", "name": "16", "imageFileName": "oll16.gif", "moves": "(r U r') (Match U') (r U' r')", "comments": "This is just a fast trigger with a fast setup before and after." },
	{ "type": "oll", "name": "14", "imageFileName": "oll14.gif", "moves": "(R' F) (Match F' R) y' Slot y", "comments": "This case is pretty nice, but like OLL #13, I don't like the rotation." },
	{ "type": "oll", "name": "15", "imageFileName": "oll15.gif", "moves": "(l' U' l) (L' U' L U) (l' U l)", "comments": "This is just the mirror of OLL #16." },
	{ "type": "oll", "name": "41", "imageFileName": "oll41.gif", "moves": "(R U') (R' U2) (R U) y (R U') (R' U' F') y'", "comments": "This case looks difficult, but it's actually pretty easy and flows kind of nicely." },
	{ "type": "oll", "name": "30", "imageFileName": "oll30.gif", "moves": "(R2' U R' B') (R U') (R2' U) (l U l')", "comments": "After the first set of moves, everything picks up a bit and it's easy to finish the algorithm." },
	{ "type": "oll", "name": "42", "imageFileName": "oll42.gif", "moves": "(L' U) (L U2) (L' U') y' (L' U) (L U F) y", "comments": "This is just the mirror of OLL #41." },
	{ "type": "oll", "name": "29", "imageFileName": "oll29.gif", "moves": "(L2 U' L B) (L' U) (L2 U') (r' U' r)", "comments": "This is just the mirror of OLL #30." },
]*/

var oll1look = {
	name: "Align Edges",
	algs: [
		{ moves: "F (Sexy) F'", name: "opposite", image: {stage: 'oell'} },
		{ moves: "f (Sexy) f'", name: "adjacent", image: {stage: 'oell'} },
		{ moves: "[F (Sexy) F'] [f (Sexy) f']", name: "none", image: {stage: 'oell'} }
	]}


var oll = [
	{
		name: "All Edges Correctly Oriented",
		algs: [ /* http://badmephisto.com/2LookOLL.pdf */
			{ type: "oll", moves: "Shoot DoubleSlot", name: "27-Sune", comment: "fish like, head is front-left, front side sticker adjacent" },
			{ type: "oll", moves: "(Shoot DoubleSlot)^", name: "26-Anti Sune", comment: "fish like, head is left-back, left side sticker opposite" },
			{ type: "oll", moves: "[F: Sexy3]", name: "21-Car" },
			{ type: "oll", moves: "[f: Sexy] [F: Sexy]", name: "22-Blinker" },
			{ type: "oll", moves: "(R2 D) (R' U2) (R D') (R' U2 R')", name: "23-Headlights" },
			{ type: "oll", moves: "FatSexy FatSledge", name: "24-Chameleon" },
			{ type: "oll", moves: "F' (FatSexy) (r' F R )", name: "25-Bowtie", comment: "Like Chameleon shifted" },
		]
	},
	{
		name: "No Edges Correctly Oriented",
		algs: [
			{ type: "oll", moves: "DoubleSlot Sledge U2 Sledge", name: "1-Runway" },
			{ type: "oll", moves: "[F: Sexy] [f: Sexy]", name: "2-Zamboni", comment: "Same as Blinker, but first F and then f" },
			{ type: "oll", moves: "[f: Sexy] U [F: Sexy]", name: "4-Nazi", comment: "Blinker with a U in the middle" },
			{ type: "oll", moves: "[f: Sexy] U' [F: Sexy]", name: "3-Anti Nazi" },
			{ type: "oll", moves: "Shoot Sledge U2 Sledge", name: "17-Slash", comment: "Similar to Runway but with Shoot instead of DoubleSlot" },
			{ type: "oll", moves: "[M U Sexy] M2 FatSexy'", name: "20-Checkers" },
			{ type: "oll", moves: "[F Shoot] y' R' U2 Sledge", name: "18-Crown" },
			{ type: "oll", moves: "[M U Sexy] M' Sledge", name: "19-Bunny", comment: "Starts like Checkers" },
		]
	},
	{
		name: "C shapes",
		algs: [
			{ type: "oll", moves: "[(R' U'): Sledge]", name: "46-C & Headlights" },
			{ type: "oll", moves: ["Sexy B' Sledge B", "R U R2 U' R' F R U R U' F'"], name: "34-City" },
		]
	},
	{
		name: "I shapes",
		algs: [
			{ type: "oll", moves: "DoubleSlot Shoot^ R' U2 F R F'", name: "55-Highway", comment: 'Starts like Runway' },
			{ type: "oll", moves: "Shoot R d' Slot F' y'", name: "52-Rice Cooker" },
			{ type: "oll", moves: "[f: Sexy2]", name: "51-Bottlecap" },
			{ type: "oll", moves: "[F Sexy R] F' [FatSexy] r'", name: "56-Streetlights" },
		]
	},
	{
		name: "L shapes",
		algs: [
			{ type: "oll", moves: "[F: Sexy2]", name: "48-Breakneck" },
			{ type: "oll", moves: ["[F': Sexy~2]", "[(R' U'): Sledge2]"], name: "47-Anti Breakneck", comment: "Mirror on the x axis of Breakneck" },
			{ type: "oll", moves: "r' U' Slot U Slot U2 r", name: "53-Frying Pan" },
			{ type: "oll", moves: "r U Slot^ U' Slot^ U2 r'", name: "54-Anti Frying Pan", comment: "This is Frying Pan with each move reversed" },
			{ type: "oll", moves: ["r U' r2 U r2 U r2 U' r", "l U' l2 U l2 U l2 U' l", "[R' F R' F'] R2 U2 y [Sledge]"], name: "49-Right Back Squeezy", comment: "the l variant is RFS mirrored on x" },
			{ type: "oll", moves: ["(r U' r2 U r2 U r2 U' r)^", "R' F R2 B' R2' F' R2 B R'"], name: "50-Right Front Squeezy", comment: "RBS reversed" },
		]
	},
	{
		name: "P shapes",
		algs: [
			{ type: "oll", moves: "[f: Sexy]", name: "44-P" },
			{ type: "oll", moves: "[f': Sexy~]", name: "43-Anti P" },
			{ type: "oll", moves: "[R' U'] [F: Ugly] R", name: "31-Couch" },
			{ type: "oll", moves: "([R' U'] [F: Ugly] R)^", name: "32-Anti Couch", comment: "Couch in the back" },
		]
	},
	{
		name: "T shapes",
		algs: [
			{ type: "oll", moves: "[F: Sexy]", name: "45-Suit Up" },
			{ type: "oll", moves: "Sexy Sledge", name: "33-Shoelaces" },
		]
	},
	{
		name: "W shapes",
		algs: [
			{ type: "oll", moves: "[L' U' L U'] [L' U L U] [L F' L' F]", name: "36-Mario" },
			{ type: "oll", moves: "Shoot [Slot U'] [Sledge]", name: "38-Wario" },
		]
	},
	{
		name: "Awkward shapes",
		algs: [
			{ type: "oll", moves: "M U [Sexy] [Sledge] M'", name: "29-Spotted Chameleon" },
			{ type: "oll", moves: "R2 U R' B' R U' R2 U R B R'", name: "30-Anti Spotted Chameleon" },
			{ type: "oll", moves: "[Slot U2] R U y Slot U' F'", name: "41-Awkward Fish" },
			{ type: "oll", moves: "R' U2 Shoot R y [F Sexy F']", name: "42-Anti Awkward Fish" },
		]
	},
	{
		name: "Fish shapes",
		algs: [
			{ type: "oll", moves: "[Sexy R' F] R2 U R' U' F'", name: "9-Kite" },
			{ type: "oll", moves: "Shoot [Sledge] [DoubleSlot]", name: "10-Anti Kite" },
			{ type: "oll", moves: "R U2 [R2 F R F'] [DoubleSlot]", name: "35-Fish" },
			{ type: "oll", moves: "F Slot U' Match F'", name: "37-Mounted Fish" },
		]
	},
	{
		name: "Knight Move shapes",
		algs: [
			{ type: "oll", moves: "r U' r' U' r U r' y' [Slot^]" , name: "13-Gun"},
			{ type: "oll", moves: "R' F Match F' R y' [Slot]", name: "14-Anti Gun" },
			{ type: "oll", moves: "[l' U' l] [L' U' L U] [l' U l]", name: "15-Squeegee" },
			{ type: "oll", moves: "[r U r'] [Sexy] [r U' r']", name: "16-Anti Squeegee" },
		]
	},
	{
		name: "Big Lightning Bolts shapes",
		algs: [
			{ type: "oll", moves: "[L F' L' U' L U F] U' L'", name: "39-Fung" },
			{ type: "oll", moves: "[R' F Sexy F'] U R", name: "40-Anti Fung" },
		]
	},
	{
		name: "Small Lightning Bolts shapes",
		algs: [
			{ type: "oll", moves: "[r U R' U] [R U2 r']", name: "7-Lightning" },
			{ type: "oll", moves: "DoubleSlot U2 Sledge", name: "8-Reverse Lightning" },
			{ type: "oll", moves: "[F Sexy F'] U [F Sexy F']", name: "12-Upstairs" },
			{ type: "oll", moves: "[F' L' U' L U F] y [F Sexy F'] y'", name: "11-Downstairs" },
		]
	},
	{
		name: "Square shapes",
		algs: [
			{ type: "oll", moves: "r U2 Match^ U' r'", name: "6-Righty Square" },
			{ type: "oll", moves: "l' U2 L U L' U l", name: "5-Lefty Square" },
		]
	},
	{
		name: "Arrow & H shapes",
		algs: [
			{ type: "oll", moves: "M' U M U2 M' U M", name: "28-Arrow" },
			{ type: "oll", moves: "[Sexy] M' [U R U' r']", name: "57-H" },
		]
	},

]

/*
var pll = [
	{ "type": "pll", "name": "Aa", "imageFileName": "pll01.gif", "moves": "x (R' U R') D2 Slot D2 R2 x'", "comments": "This is a basic corner 3-cycle. It is one of my favorite and fastest algorithms. Perform the D2s with the left hand and everything else with the right." },
	{ "type": "pll", "name": "Ab", "imageFileName": "pll02.gif", "moves": "x R2 D2 Match D2 (R U' R) [y'] y x'", "comments": "This is just the inverse of the other A perm. It is performed in a very similar manner." },
	{ "type": "pll", "name": "E", "imageFileName": "pll03.gif", "moves": "x' (R U') (R' D) (Match D') (Match D) (R U') (R' D') x", "comments": "This alg is just two orientations performed consecutively." },
	{ "type": "pll", "name": "Ua", "imageFileName": "pll06.gif", "moves": "(R U' R U) (R U) (R U') (R' U' R2)", "comments": "This is just a simple 3-edge cycle. It is almost as fast as the corner cycles. I solve this case with the bar at the front or the back." },
	{ "type": "pll", "name": "Ub", "imageFileName": "pll07.gif", "moves": "(R2 U) (Match U') (R' U') (R' U R')", "comments": "This is the inverse of the other U perm. I place my hands slightly differently for this algorithm. I solve this case with the bar at the front or the back." },
	{ "type": "pll", "name": "H", "imageFileName": "pll05.gif", "moves": "(M2' U) (M2' U2) (M2' U) M2'", "comments": "This is extremely easy to recognize and can be performed VERY quickly. The M'2 is actually performed as (M'M') with rapid Sloting at the back face of the M layer with the ring and then middle fingers." },
	{ "type": "pll", "name": "Z", "imageFileName": "pll04.gif", "moves": "(M2' U) (M2' U) (M' U2) (M2' U2) (M' U2)", "comments": "The Z permutation is performed very similarly to the H perm. The last U2 is not necessary if you account for it before the algorithm." },
	{ "type": "pll", "name": "Ja", "imageFileName": "pll08.gif", "moves": "(R' U L') U2 Slot U2 (L R U')", "comments": "I perform the R of the [R L] a split second after I start the L so that I can immediately perform the U' to AUF when the L face has been moved to where it belongs." },
	{ "type": "pll", "name": "Jb", "imageFileName": "pll09.gif", "moves": "(Match F') (Match U') (R' F) (R2 U') (R' U')", "comments": "This is the same as the T perm with the last four moves instead performed at the beginning." },
	{ "type": "pll", "name": "T", "imageFileName": "pll10.gif", "moves": "(Match U') (R' F) (R2 U') (Match^ U) (R' F')", "comments": "This is the T permuation. It is long but definitely very fast and easy. It can be performed in almost one swift motion without any readjusting of the fingers. Note that it is a combination of two easy orientations." },
	{ "type": "pll", "name": "Rb", "imageFileName": "pll11.gif", "moves": "(R' U2) (R U2) (R' F Match U') (R' F' R2 U')", "comments": "This is a pretty straightforard alg that flows pretty nicely." },
	{ "type": "pll", "name": "Ra", "imageFileName": "pll12.gif", "moves": "Match F' DoubleSlot U2 R' F R U DoubleSlot U'", "comments": "You could also just mirror Rb, but this alg is more right hand friendly. Notice the similarity with the Jb permutation." },
	{ "type": "pll", "name": "F", "imageFileName": "pll13.gif", "moves": "R' U' F' (Match U') (R' F) (R2 U') (Match^ U) (Slot^)", "comments": "This is a T permutation with a 3 move setup in the beginning and a cancellation of one of those moves at the end." },
	{ "type": "pll", "name": "Ga", "imageFileName": "pll15.gif", "moves": "(R2' u) (R' U Match^ u') R2' y' (Slot^) y", "comments": "This alg has a pretty decent flow to it and can be performed almost in one motion until the rotation." },
	{ "type": "pll", "name": "Gb", "imageFileName": "pll16.gif", "moves": "(Match^) y (R2' u R' U) (R U' R u' R2') y'", "comments": "This is the inverse of Ga. Note how similar they look. I perform this one almost exactly the same way." },
	{ "type": "pll", "name": "Gc", "imageFileName": "pll14.gif", "moves": "(R2' u' R U') (Match u R2) (f R' f')", "comments": "You could rotate and insert the pair instead of performing the last three moves as shown." },
	{ "type": "pll", "name": "Gd", "imageFileName": "pll17.gif", "moves": "Match y' (R2' u' R U') (R' U R' u R2) y", "comments": "This is just the inverse of Gc. I execute it very similarly because most of the moves overlap in the same manner." },
	{ "type": "pll", "name": "V", "imageFileName": "pll18.gif", "moves": "(R' U R' d') (R' F' R2 U') (R' U R' F) (R F) y'", "comments": "This is one of my least favorite permutations because the flow just isn't there." },
	{ "type": "pll", "name": "Na", "imageFileName": "pll19.gif", "moves": "(z) D (R' U) (R2 D' R D U') (R' U) (R2 D' R U' R) z'", "comments": "This alg could also be performed using <R,U,L> if you don't do the rotation, but this way is faster with practice." },
	{ "type": "pll", "name": "Nb", "imageFileName": "pll20.gif", "moves": "(z) U' (R D') (R2' U R' D U') (R D') (R2' U R' D R') z'", "comments": "This is just the mirror of the other N permutation." },
	{ "type": "pll", "name": "Y", "imageFileName": "pll21.gif", "moves": "(F R U') (Match^ U) (R' F') (Match U') (R' F R F')", "comments": "This is very quick and can be performed without any adjustments of where the fingers are. It is just a combination of two quick orientations." }
] */

// 3B - 3bar (full bar), 3C - 3 colors, HL - headlights, O2B - outer 2bar, I2B - inner 2bar, BE - bookend, NBG - narrow BE, (adj) additional color is from adjacent face, 
var pll = [
	{
		name: "Edge Permutations Only",
		algs: [
			{ type: "pll", moves: "<bl>M2 U <r>[M U2 M']</r> U M2</bl>", name: "Ua", image_comment: "HL, HL: 3 colors | 3B, HL | 3B, HL | HL, HL: 3 colors "}, // R2 U [Sexy] (R' U') (Pull)
			{ type: "pll", moves: "<bl>M2 U' <r>[M U2 M']</r> U' M2</bl>", name: "Ub", image_comment: "HL, HL: 3 colors | 3B, HL | 3B, HL | HL, HL: 3 colors" }, // [R U'] [R U] [R U] [R U'] R' U' R2
			{ type: "pll", moves: "<bl>M2 U <r>M2 U2 M2'</r> U M2</bl>", name: "H", image_comment: "HL(opp), HL(opp) | HL(opp), HL(opp) | HL(opp), HL(opp) | HL(opp), HL(opp) |" },
			{ type: "pll", moves: "{(<bl>M2 U</bl>) (<bl>M2 U</bl>)} {(<g>M' U2</g>) (<bl>M2 U2</bl>) (<g>M' U2</g>)}", name: "Z", image_comment: "HL, HL: checkers | HL(adj), HL(adj): 4 colors | HL, HL: checkers | HL(adj), HL(adj): 4 colors" },
		]
	},
	{
		name: "Corner Permutations Only",
		algs: [
			{ type: "pll", moves: "x [Pull D2] [Slot D2] R2 x'", name: "Aa", image_comment: "O2B(opp), 3C: 4 colors | HL(adj), 3C | O2B, HL: 4 colors | I2B, I2B: BE" },
			{ type: "pll", moves: "x' [Pull^ D2] [Slot^ D2] R2 x", name: "Ab", image_comment: " HL(adj), 3C | O2B(opp), 3C: 4 colors | I2B, I2B: BE | O2B + HL: 4 colors" },
			{ type: "pll", moves: ["x' [Slot D] [Match D'] [Match D] [Slot D'] x", "x' [Slot, D] [Match, D] x"], name: "E", image_comment: "NBE, 4 checkers,opp middle | NBE, 4 checkers,opp middle | NBE, 4 checkers,opp middle | NBE, 4 checkers,opp middle"},
		]
	},
	{
		name: "Corner & Edge Swap",
		algs: [
			{ type: "pll", moves: "<r>{[Sexy] [R' F] [R2 U' R'] U'}</r> <bl>[Match F']</bl>", name: "T", image_comment: "O2B(adj), 3C: 4 colors | O2B(adj), 3C: 4 colors | I2B, HL: 3 colors | I2B, HL: 3 colors" },
			{ type: "pll", moves: "[R' U L'] [U2 Slot U2] [R L U']", name: "Ja", image_comment: "3B, 2B | O2B, I2B : BE | O2B, I2B : BE | 3B, 2B"},
			{ type: "pll", moves: "<bl>[Match F']</bl> <r>{[Sexy] [<r>R' F</r>] [<m>R2 U' R'</m>] U'}</r>", name: "Jb", image_comment: "O2B, I2B : BE | O2B, I2B : BE | 3B, 2B | 3B, 2B" },
			{ type: "pll", moves: ["F Slot U' <bl>[Match F']</bl> Sexy Sledge", "[F Slot: U'] Sexy Sledge"], name: "Y", image_comment: "O2B, O2B | I2B: NBE | 3C, 3C: NBE, same 2 color external | I2B: NBE" },
			{ type: "pll", moves: ["<bl>[Match F']</bl> DoubleSexy [<r>R' F</r>] R U DoubleSlot U'", "[L U2 L' U2] [L F'] [L' U' L U] [L F] L2' U"], name: "Ra", image_comment: "HL, I2B: 4 colors | O2B(adj), 3C: adj twice | 3C, 3C: BE adj twice | HL, 3C : checkers "},
			{ type: "pll", moves: "DoubleSexy^ [<r>R' F</r>] Sexy [<g>R' F' R2 U'</g>]", name: "Rb", image_comment: "HL, 3C : checkers | 3C, 3C: BE adj twice | O2B(adj), 3C: adj twice | HL, I2B: 4 colors " },
			{ type: "pll", moves: "Pull d' [<g>R' F' R2 U'</g>] Pull [F R F] y'", name: "V", image_comment: "O2B: NBE | 4checkers: NBE | O2B: NBE | I2B, I2B: NBE"},
			{ type: "pll", moves: ["R' U' F' Match <bl>{U' R' F [<m>R2 U' R'</m>]}</bl> U' Shoot R", "[R' U2 R' d'] [R' F'] [R2 U' R' U] [R' F R U' F] y'"], name: "F", image_comment: "4checkers: BE | 3B, 3C: 4 colors | 3B, 3C: 4 colors | 4checkers: BE"},
			{ type: "pll", moves: ["Shoot Match F' Match <bl>{U' R' F [<m>R2 U' R'</m>]}</bl> U2 Slot","{(L U' R) U2 (L' U R')} {(L U' R) U2 (L' U R')} U"], name: "Na", image_comment: "I2B, O2B: NBE | I2B, O2B: NBE | I2B, O2B: NBE | I2B, O2B: NBE" },
			{ type: "pll", moves: ["R' U Slot F' U' F Match F R' F' Pull^", "R' [U,  Slot F'] [F : R'] Pull^", "{(R' U L') U2 (R U' L)} {(R' U L') U2 (R U' L)} U'"], name: "Nb", image_comment: "I2B, O2B: NBE | I2B, O2B: NBE | I2B, O2B: NBE | I2B, O2B: NBE" },
		]
	},
	{
		name: "Corner & Edge Cycle Permutations (G perms)",
		algs: [
			{ type: "pll", moves: "R2 u Pull U' R u' R2 [y' Slot^] y", name: "Ga", image_comment: "I2B(adj): BE  | BE + opp *2  | 4 checker | O2B, HL: 4 col" },
			{ type: "pll", moves: "[Match^] y R2 u R' U Pull^ u' R2 y'", name: "Gb", image_comment: "O2B(opp) : opp * 2 | I2B(opp): BE | HL(opp), 3C | HL(opp), 3C" },
			{ type: "pll", moves: "R2 u' R U' Match u R2 [y Slot] y'", name: "Gc", image_comment: "BE, opp *2 | I2B: BE adj | O2B, HL: 4 col | 4 checker" },
			{ type: "pll", moves: "[Match] y' R2 u' Slot U R' u R2 y", name: "Gd", image_comment: "I2B(opp): BE | O2B(opp) : opp * 2 | HL(opp), 3C | HL(opp), 3C" },
		]
	}
]

function invert(moves) {
	return moves.split(" ").map(m => {
		if (m.length == 1) return m + "'";
		switch(m.charAt(1)) {
			case "'": return m.slice(0, -1);
			case "2": return m;
		}
	}).reverse().join(" ");
}

var triggers = {
}

function add(name, moves, order, inverse) {
	triggers[name] = {moves: moves, inverse: inverse, order: order}
	if (inverse && inverse != name) {
		triggers[inverse] = {moves: invert(moves), inverse: name, order: order}
	}
}

add("Sexy", "R U R' U'", 6, "Ugly")
add("FatSexy", "r U R' U'", 12)
add("Sledge", "R' F R F'", 6, "Hedge")
add("FatSledge", "r' F R F'", 12)
add("Match", "R U R'", 4, "Slot");
add("Pull", "R' U R'", 30)
add("Slot", "R  U' R'", 4, "Match")
add("DoubleSlot", "R U2 R'", 2, "DoubleSlot")
add("DoubleSexy", "R U2 R' U2", 15)
add("Shoot", "R U R' U", 5)

export  {
	f2l,
	oll1look,
	oll,
	pll,
	triggers
}
