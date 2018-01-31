(function () {

	const USE_CHAR_CODE = Symbol.for('USE_CHAR_CODE'),
		USE_FUNCTION = Symbol.for('USE_FUNCTION');

	const DEFAULT_FN = '[]["filter"]',
		DEFAULT_STRING = '([]+[])';

	const REGEX = {
		'Constructor': 		'',
		'Simple': 			'',
		'Digit': 			/(\+[\d]+|[\d]+)(?![^\"+]*\"\B)/gi,
		'NotDigit': 		/([^\d]+)/gi,
		'DigitWithinQuotes':/(\+[\d]+|[\d]+)/gi,
		'OnlyDigit': 		/(\d)/gi,
		'WithinQuotes': 	/\"[^\"]+\"/gi,
		'Char': 			/[^\+]{1}/gi,
		'All': 				/./gi,
		'Plus': 			/\+/gi,
		'Open': 			/\(/gi,
		'Close': 			/\)/gi,
		'Quotes': 			/\"/gi,
		'InvalidCharacters':/(?!(\+|\!|\[|\]|\(|\)))./gi
	};

	const NUMBS = {
		'0': '+[]',
		'1': '+!![]'
	}

	const SIMPLE = {
		'false': 	'![]',
		'true': 	'!![]',
		'undefined':'[][[]]',
		'NaN': 		'+[![]]',
		'Infinity': '+(+!![]+(!![]+[])[!![]+!![]+!![]]+[+!![]]+[+[]]+[+[]]+[+[]])' // +"1e1000"
	};

	const CONSTRUCTORS = {
		'Array': 	'[]',
		'Number': 	'(+[])',
		'String': 	DEFAULT_STRING,
		'Boolean': 	'(![])',
		'Function': DEFAULT_FN,
		'Object': 	`${DEFAULT_FN}["constructor"]("return{}")()`,
		'RegExp': 	`${DEFAULT_FN}["constructor"]("return/0/")()`,
		'Symbol': 	'Function("return Symbol()")()',
		'Date': 	USE_FUNCTION,
		'Map': 		USE_FUNCTION,
		'WeakMap': 	USE_FUNCTION,
		'Set': 		USE_FUNCTION,
		'WeakSet': 	USE_FUNCTION
	};

	//25 USE_CHAR_CODE
	//10 TO_STRING
	const MAPPING = {
		'a': '(false+[])[1]',
		'b': createToString(11, 20),
		'c': `(${DEFAULT_FN}+[])[3]`,
		'd': '(undefined+[])[2]',
		'e': '(true+[])[3]',
		'f': '(false+[])[0]',
		'g': '([0]+false+String)[20]',
		'h': `${createToString(101, 21)}[1]`,
		'i': '([false]+undefined)[10]',
		'j': `${createToString(40, 21)}[1]`,
		'k': createToString(20, 21),
		'l': '(false+[])[2]',
		'm': '(Number+[])[11]',
		'n': '(undefined+[])[1]',
		'o': '(true+' + DEFAULT_FN + ')[10]',
		'p': `${createToString(211, 31)}[1]`,
		'q': `${createToString(212, 31)}[1]`,
		'r': '(true+[])[1]',
		's': '(false+[])[3]',
		't': '(true+[])[0]',
		'u': '(undefined+[])[0]',
		'v': createToString(31, 32),
		'w': createToString(32, 33),
		'x': `${createToString(101, 34)}[1]`,
		'y': '(NaN+[Infinity])[10]',
		'z': createToString(35, 36),

		'(': `(false+${DEFAULT_FN})[20]`,
		')': `(true+${DEFAULT_FN})[20]`,

		'A': '(0+Array)[10]',
		'B': '(0+Boolean)[10]',
		'C': 'Function("return escape")()("<")[2]',
		'D': 'Function("return escape")()("=")[2]',
		'E': '(RegExp+[])[12]',
		'F': '(0+Function)[10]',
		'G': '(false+Function("return Date")()())[30]',
		'H': USE_CHAR_CODE,
		'I': '(Infinity+[])[0]',
		// 'J': '([0]+false+Function("return new Date("+(10000000)+")")())[10]',
		'J': USE_CHAR_CODE, //6581
		'K': USE_CHAR_CODE,
		'L': USE_CHAR_CODE,
		'M': '(true+Function("return Date")()())[30]',
		'N': '(NaN+[])[0]',
		// 'O':	'([0]+false+Function("return new Date(11101000000000)")())[10]',
		'O': '(0+Object)[10]',
		'P': USE_CHAR_CODE,
		'Q': USE_CHAR_CODE,
		'R': '(0+RegExp)[10]',
		'S': '(0+String)[10]',
		'T': '(NaN+Function("return Date")()())[30]',
		'U': USE_CHAR_CODE,
		'V': USE_CHAR_CODE,
		'W': '(Function("return new Date("+1+")")()+[])[0]',
		'X': USE_CHAR_CODE,
		'Y': USE_CHAR_CODE,
		'Z': USE_CHAR_CODE,

		' ': `(NaN+${DEFAULT_FN})[11]`,
		'!': USE_CHAR_CODE,
		'"': `${DEFAULT_STRING}["fontcolor"]()[12]`,
		'#': USE_CHAR_CODE,
		'$': USE_CHAR_CODE,
		'%': 'Function("return escape")()("<")[0]',
		'&': USE_CHAR_CODE,
		'\'': USE_CHAR_CODE,
		'*': USE_CHAR_CODE,
		'+': '(+(1+(true+[])[3]+(100))+[])[2]',
		',': '[[]]["concat"]([[]])+[]',
		'.': '(+(11+(true+[])[3]+(20))+[])[1]',
		'-': '(+(".0000000001")+[])[2]',
		'/': '([0]+false)["italics"]()[10]',

		':': '(RegExp()+[])[3]',
		';': USE_CHAR_CODE,
		'<': `${DEFAULT_STRING}["italics"]()[0]`,
		'=': `${DEFAULT_STRING}["fontcolor"]()[11]`,
		'>': `${DEFAULT_STRING}["italics"]()[2]`,
		'?': '(RegExp()+[])[2]',
		'@': USE_CHAR_CODE,

		'[': `(${DEFAULT_FN}+[])[20]`,
		'\\': USE_CHAR_CODE,
		']': `(${DEFAULT_FN}+[])[32]`,
		'^': USE_CHAR_CODE,
		'_': USE_CHAR_CODE,
		'`': USE_CHAR_CODE,

		'{': `(NaN+${DEFAULT_FN})[21]`,
		'|': USE_CHAR_CODE,
		'}': `([0]+false+${DEFAULT_FN})[40]`,
		'~': USE_CHAR_CODE
	};

	function createToString(number, radix) {
		return `(+(${number}))["toString"](${radix})`;
	}

	function createRegex() {
		let regex = '(',
			key;

		const endRegex = ')(?![^"]*"\\B)';

		for (key in CONSTRUCTORS)
			regex += `\\b${key}\\b|`;
		REGEX["Constructor"] = new RegExp(regex.substr(0, regex.length - 1) + endRegex, "gi");

		regex = '(';
		for (key in SIMPLE)
			regex += `\\b${key}\\b|`;
		REGEX["Simple"] = new RegExp(regex.substr(0, regex.length - 1) + endRegex, "gi");
	}

	function fillWithCharCode(c) {
		var value = c.charCodeAt(0).toString(16);
		return `Function("return unescape")()("%"+${
			REGEX["NotDigit"].test(value) ?
				"(" + value.replace(REGEX["NotDigit"], ")+\"$1\"") :
				value.replace(REGEX["Digit"], "($1)")
			})`;
	}

	function fillNumbers() {
		for (let number = 2; number < 10; number++)
			NUMBS[number] = NUMBS["1"].repeat(number).substr(1);
	}

	function fillMissingChars() {
		let key;

		for (key in CONSTRUCTORS) {
			if (CONSTRUCTORS[key] === USE_FUNCTION)
				CONSTRUCTORS[key] = `Function("return new ${key}")`;
		}

		for (key in MAPPING) {
			if (MAPPING[key] === USE_CHAR_CODE)
				MAPPING[key] = fillWithCharCode(key);
		}
	}

	function replaceMapper() {
		for (let character in MAPPING)
			MAPPING[character] = replaceInMap(MAPPING[character]);
	}

	function replaceInMap(value) {
		value = value.replace(REGEX["Constructor"], key => `${CONSTRUCTORS[key]}["constructor"]`);

		value = value.replace(REGEX["Simple"], key => SIMPLE[key]);

		return replaceDigit(value, REGEX["Digit"]);
	}

	function replaceDigit(value, regex) {
		return value.replace(regex,
			function (_, y) {
				y = y.replace(REGEX["Plus"], "");
				if (y.length > 1) {
					let isFirstDigit = true;
					y = y.replace(REGEX["OnlyDigit"],
						(_, key) => {
							if (isFirstDigit) {
								isFirstDigit = false;
								return NUMBS[key];
							}

							return `+[${NUMBS[key]}]`;
						});
					return y;
				}

				return NUMBS[y];
			});
	}

	function replaceCharWithinQuotes(value, missing) {
		missing = missing || {};
		value = value.replace(REGEX["InvalidCharacters"],
			c => missing[c] ? c : MAPPING[c] || `[${NUMBS[c]}]`);
		return value;
	}

	function replaceStrings() {
		let key,
			missing,
			count = 0;

		const findMissing = function () {
			let value,
				findMissing = false;

			missing = {};

			for (key in MAPPING) {
				value = MAPPING[key];

				if (REGEX["InvalidCharacters"].test(value)) {
					missing[key] = value;
					findMissing = true;
				}
			}

			return findMissing;
		};

		for (key in MAPPING) {
			MAPPING[key] = MAPPING[key].replace(REGEX["WithinQuotes"],
				a => a
					.replace(REGEX["Quotes"], "")
					.split('')
					.join('+')
					.replace(REGEX["Open"], '"("')
					.replace(REGEX["Close"], '")"')
					.replace('"("', MAPPING["("])
					.replace('")"', MAPPING[")"]));

			count++;
		}

		while (findMissing() && count !== -1) {
			for (key in missing)
				MAPPING[key] = missing[key] = replaceCharWithinQuotes(MAPPING[key], missing);

			if (count-- === 0)
				console.error("Could not compile the following chars:", missing);
		}
	}

	function configureOneValue(value) {
		value = replaceInMap(value);
		return replaceCharWithinQuotes(value);
	}

	function encode(input, wrapWithEval) {
		const outputArray = [];
		let output = "",
			replacement = "";

		if (!input)
			return "";

		input.replace(REGEX["Simple"],
			function (key) {
				outputArray.push(`${SIMPLE[key]}+[]`);
				return "";
			}).replace(REGEX["All"],
			function (key) {
				replacement = (!MAPPING[key] && !NUMBS[key]) ?
					MAPPING[key] = configureOneValue(fillWithCharCode(key)) :
					MAPPING[key] || `[${NUMBS[key]}]`;

				outputArray.push(replacement);
			});

		output = outputArray.join("+");

		if (wrapWithEval)
			output = configureOneValue(`${DEFAULT_FN}["constructor"](${output})()`);

		return output;
	}

	function validateMapper(dontvalidateChars) {
		let key,
			val,
			str;

		for (key in MAPPING) {
			str = MAPPING[key];
			val = eval(str);
			console.log(`${key} : ${val} - ${str.length}`);

			if (key !== val)
				throw "Different values!";

			if (!dontvalidateChars && REGEX["InvalidCharacters"].test(str))
				throw "Invalid Characters";
		}

		// Object.keys(MAPPING).reduce((arr, key) => { 
		// 	arr.push({ key, length: MAPPING[key].length, value: MAPPING[key] }); 
		// 	return arr; 
		// }, []).sort((a, b) => a.length - b.length);
		// Object.keys(MAPPING).map(key => MAPPING[key]).join("").length; //239228
	}

	createRegex();
	fillNumbers();
	fillMissingChars();

	replaceMapper();
	replaceStrings();

	var JSFuck = {
		Encode: encode
	};

	if (!!X)
		X.JSFuck = Xand.JSFuck = Xandelier.JSFuck = JSFuck;
	else
		window.JSFuck = JSFuck;

})();