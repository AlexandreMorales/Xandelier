(function(){

	var USE_CHAR_CODE = 'USE_CHAR_CODE',
		USE_FUNCTION = 'USE_FUNCTION';
	
	var DEFAULT_FN = '[]["filter"]',
		DEFAULT_STRING = '([]+[])';
	
	var REGEX = {
		'Constructor':	'', 
		'Simple':		'', 
		'Digit':		/(\+[\d]+|[\d]+)(?![^\"]*\"\B)/gi,
		'OnlyDigit':	/(\d)/gi,
		'Quotes':		/\"([^\"]+)\"/gi,
		'Char':			/[^\+]{1}/gi,
		'All':			/./gi,
		'Plus':			/\+/gi,
		'InvalidCharacters':	/(?!(\+|\!|\[|\]|\(|\)))./gi
	};
	
	var NUMBS ={
		'0':	'+[]',
		'1':	'+!![]'
	}
	
	var SIMPLE = {
		'false':      '![]',
		'true':       '!![]',
		'undefined':  '[][[]]',
		'NaN':        '+[![]]',
		'Infinity':   '+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])' // +"1e1000"
	};
	
	var CONSTRUCTORS = {
		'Array':    '[]',
		'Number':   '(+[])',
		'String':   DEFAULT_STRING,
		'Boolean':  '(![])',
		'Function': DEFAULT_FN,
		'Object':   '({})',
		'RegExp':   `${DEFAULT_FN}["constructor"]("return/0/")()`,
		'Symbol':	'Function("return Symbol()")()',
		'Date':		USE_FUNCTION,
		'Map':		USE_FUNCTION,
		'WeakMap':	USE_FUNCTION,
		'Set':		USE_FUNCTION,
		'WeakSet':	USE_FUNCTION
	};
	
	var createToString = (number, radix) => `(${number})["toString"](${radix})`;
	
	//24 USE_CHAR_CODE
	//10 TO_STRING
	var MAPPING = {
		'a':   '(false+[])[1]',
		'b':   createToString(11, 20), 
		'c':   `(${DEFAULT_FN}+[])[3]`,
		'd':   '(undefined+[])[2]',
		'e':   '(true+[])[3]',
		'f':   '(false+[])[0]',
		'g':   '([0]+false+String)[20]',
		'h':   `${createToString(101, 21)}[1]`,
		'i':   '([false]+undefined)[10]',
		'j':   `${createToString(40, 21)}[1]`,
		'k':   createToString(20, 21),
		'l':   '(false+[])[2]',
		'm':   '(Number+[])[11]',
		'n':   '(undefined+[])[1]',
		'o':   '(true+' + DEFAULT_FN + ')[10]',
		'p':   `${createToString(211, 31)}[1]`,
		'q':   `${createToString(212, 31)}[1]`, 
		'r':   '(true+[])[1]',
		's':   '(false+[])[3]',
		't':   '(true+[])[0]',
		'u':   '(undefined+[])[0]',
		'v':   createToString(31, 32),
		'w':   createToString(32, 33),
		'x':   `${createToString(101, 34)}[1]`,
		'y':   '(NaN+[Infinity])[10]',
		'z':   createToString(35, 36),
		
		'A':   '(0+Array)[10]',
		'B':   '(0+Boolean)[10]',
		'C':   'Function("return escape")()("<")[2]',
		'D':   'Function("return escape")()("=")[2]',
		'E':   '(RegExp+[])[12]',
		'F':   '(0+Function)[10]',
		'G':   '(false+Function("return Date")()())[30]',
		'H':   USE_CHAR_CODE,
		'I':   '(Infinity+[])[0]',
		'J':   '([0]+false+Function("return new Date(10000000)")())[10]',
		'K':   USE_CHAR_CODE,
		'L':   USE_CHAR_CODE,
		'M':   '(true+Function("return Date")()())[30]',
		'N':   '(NaN+[])[0]',
		'O':   '([0]+false+Function("return new Date(11101000000000)")())[10]',
		'P':   USE_CHAR_CODE,
		'Q':   USE_CHAR_CODE,
		'R':   '(0+RegExp)[10]',
		'S':   '(0+String)[10]',
		'T':   '(NaN+Function("return Date")()())[30]',
		'U':   USE_CHAR_CODE,
		'V':   USE_CHAR_CODE,
		'W':   '(Function("return new Date(1)")()+[])[0]',
		'X':   USE_CHAR_CODE,
		'Y':   USE_CHAR_CODE,
		'Z':   USE_CHAR_CODE,
		
		' ':   `(NaN+${DEFAULT_FN})[11]`,
		'!':   USE_CHAR_CODE,
		'"':   `${DEFAULT_STRING}["fontcolor"]()[12]`,
		'#':   USE_CHAR_CODE,
		'$':   USE_CHAR_CODE,
		'%':   'Function("return escape")()("<")[0]',
		'&':   USE_CHAR_CODE,
		'\'':  USE_CHAR_CODE,
		'(':   `(false+${DEFAULT_FN})[20]`,
		')':   `(true+${DEFAULT_FN})[20]`,
		'*':   USE_CHAR_CODE,
		'+':   '(+(1+(true+[])[3]+100)+[])[2]',
		',':   '[[]]["concat"]([[]])+[]',
		'.':   '(+(11+(true+[])[3]+20)+[])[1]',
		'-':   '(+("0.0000000001")+[])[2]',
		'/':   '([0]+false)["italics"]()[10]',
		
		':':   '(RegExp()+[])[3]',
		';':   USE_CHAR_CODE,
		'<':   `${DEFAULT_STRING}["italics"]()[0]`,
		'=':   `${DEFAULT_STRING}["fontcolor"]()[11]`,
		'>':   `${DEFAULT_STRING}["italics"]()[2]`,
		'?':   '(RegExp()+[])[2]',
		'@':   USE_CHAR_CODE,
		
		'[':   `(${DEFAULT_FN}+[])[20]`,
		'\\':  USE_CHAR_CODE,
		']':   `(${DEFAULT_FN}+[])[32]`,
		'^':   USE_CHAR_CODE,
		'_':   USE_CHAR_CODE,
		'`':   USE_CHAR_CODE,
		
		'{':   `(NaN+${DEFAULT_FN})[21]`,
		'|':   USE_CHAR_CODE,
		'}':   `([0]+false+${DEFAULT_FN})[40]`,
		'~':   USE_CHAR_CODE
	};
			
	function createRegex() {
		var regex = '(', 
			endRegex = ')(?![^"]*"\\B)',
			key;
		
		for (key in CONSTRUCTORS)
			regex += `\\b${key}\\b|`;
		REGEX["Constructor"] = new RegExp(regex.substring(0, regex.length - 1) + endRegex, "gi");
		
		regex = '(';
		for (key in SIMPLE)
			regex += `\\b${key}\\b|`;
		REGEX["Simple"] = new RegExp(regex.substring(0, regex.length - 1) + endRegex, "gi");
	};
	
	var fillWithCharCode = (c) => `${DEFAULT_STRING}["constructor"]["fromCharCode"](${c.charCodeAt(0)})`;
	
	function fillNumbers() {
		var number, funcRepeat = String.prototype.repeat ?
			(str, times) => str.repeat(times) :
			(str, times) => new Array(times + 1).join(str);
		
		for (number = 2; number < 10; number++)
			NUMBS[number] = funcRepeat(NUMBS["1"], number);
	};
	
	function fillMissingChars() {
		var key;
		
		for (key in CONSTRUCTORS) {
			if(CONSTRUCTORS[key] === USE_FUNCTION)
				CONSTRUCTORS[key] = `Function("return new ${key}")`;
		}
		
		for (key in MAPPING) {
			if(MAPPING[key] === USE_CHAR_CODE)
				MAPPING[key] = fillWithCharCode(key);
		}
	};
	
	function replaceMapper() {
		var character;
		
		for (character in MAPPING)
			MAPPING[character] = replaceInMap(MAPPING[character]);
	};
		
	function replaceInMap(value) {
		value = value.replace(REGEX["Constructor"], key => `${CONSTRUCTORS[key]}["constructor"]`);
		
		value = value.replace(REGEX["Simple"], key => SIMPLE[key]);
		
		return value.replace(REGEX["Digit"], 
			function(_, y) {
				y = y.replace(REGEX["Plus"], "");
				y = y.replace(REGEX["OnlyDigit"], (_, key) => `+[${NUMBS[key]}]`);
				return `+(${y.substring(1)})`;
			});
	};
	
	function replaceCharWithinQuotes(value, missing) {
		missing = missing || {};
		return value.replace(REGEX["Quotes"], 
			function(_, a) {				
				a = a.replace(REGEX["Char"], c => (missing[c] ? `"${c}"` : (MAPPING[c] || `(${NUMBS[c]})`)) + "+");				
				return a.substr(0, a.length - 1);
			});
	};
	
	function replaceStrings() {
		var all, missing, count = 0,
			findMissing = function() {
				var value, done = false;			
				missing = {};
			
				for (all in MAPPING) {
					value = MAPPING[all];
				
					if (value.match(REGEX["Quotes"])) {
						missing[all] = value;
						done = true;
					}
				}
			
				return done;
			};
		
		for (all in MAPPING)
			count++;
			
		while (findMissing() && count !== -1) {
			for (all in missing)
				MAPPING[all] = replaceCharWithinQuotes(MAPPING[all], missing);
		
			if (count-- === 0)
				console.error("Could not compile the following chars:", missing);
		}
	};
	
	function configureOneValue(value) {
		value = replaceInMap(value);
		return replacCharWithinQuotes(value);
	};
	
	function encode(input, wrapWithEval) {
		var output = [],
				replacement = "",
			original = input;
		
		if (!input)
			return "";
		
		input = input.replace(REGEX["Simple"], 
		function(c) {
				output.push(`[${SIMPLE[c]}]+[]`);
				return "";
			});
		
		input.replace(REGEX["All"], 
			function(c) {
				replacement = MAPPING[c] || (MAPPING[c] = configureOneValue(fillWithCharCode(c)));
				output.push(replacement);
			});
		
		output = output.join("+");
		
		if (wrapWithEval)
			output = configureOneValue(`${DEFAULT_FN}["constructor"](${output})()`);
		
		return output;
	};
	
	function validateMapper(){
		var key, val, str;
			
		for (key in MAPPING) {
			str = MAPPING[key];
			val = eval(str);
			console.log(key + " : " + val);
			
			if(key !== val)
				throw "Different values!";
						
			if(REGEX["InvalidCharacters"].test(str))
				throw "Invalid Characters";
		}
	};
	
	createRegex();
	fillNumbers();
	fillMissingChars();
	
	replaceMapper();
	replaceStrings();
	
	var JSFuck = {
		Encode: encode
	};

	if(!!X)
		X.JSFuck = Xand.JSFuck = Xandelier.JSFuck = JSFuck;
	else
		window.JSFuck = JSFuck;
  
})();
