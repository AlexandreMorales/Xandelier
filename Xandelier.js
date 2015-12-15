"use strict";
//////////////////////////////////////////////UTILS////////////////////////////////////////////////

/*
Parametros:
	obAjax: Objeto com as configurações do ajax:
		_path: (String) URL do ajax
                (tem que estar pré-setado a váriavel window.rootUrl que diz aonde a aplicação se encontra);
		_type: (String) Tipo de requisição em caixa alta(POST, GET, PUT, DELETE);
		_dataType: (String OU Boolean) Tipo de data a ser enviado pelo ajax, 
				se for false não irá adicionar Data-type no header do request,
				se não for enviada o valor default é 'json';
		_contentType: (String OU Boolean) Tipo de conteudo a ser enviado pelo ajax, 
				se for false não irá adicionar Content-type no header do request,
				se não for enviada o valor default é 'application/x-www-form-urlencoded; charset=UTF-8';
		_arguments: Paremetros para enviar no ajax;
		_done: (Function) função a ser executada após retorno e sucesso do ajax;
				Paramentros:
					value: O que retornou do ajax;
					xhttp: O objeto XMLHttpRequest do ajax;
		_error: (Function) função a ser executada se ocorrer algum erro durante o ajax;
				Paramentros:
					xhttp: O objeto XMLHttpRequest do ajax;
					status: O status do ajax;
					responseText: O que retornou do ajax;
*/
//Ajax com XMLHttpRequest
var AjaxPuro = function (obAjax) {
    var path = window.rootUrl + obAjax._path,
        POST = obAjax._type === "POST",
        _arguments,
        obj = obAjax._arguments;

    if (obj) {
        switch (getType(obj)) {
            case 'object':
                _arguments = Object.keys(obj).reduce((args, attr) => args +
					(getType(obj[attr]) === "array" ?
						obj[attr].reduce((indices, el) => indices + attr + "=" + el + "&", "") :
	                    attr + "=" + obj[attr] + "&"), POST ? "" : "?");
                break;
            case 'string': _arguments = (POST ? "" : "/") + obj; break;
            default: _arguments = obj; break;
        }

        if (!POST) path += _arguments;
    }
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                if (obAjax._done != undefined) {
                    var value;
                    try {
                        value = eval("(" + xhttp.responseText + ")");
                    } catch (e) {
                        value = xhttp.responseText;
                    }
                    obAjax._done(value);
                }
            } else
                if (obAjax._error != undefined)
                    obAjax._error(xhttp, xhttp.status, xhttp.responseText);
        }
    }

    xhttp.onerror = function () {
        if (obAjax._error != undefined)
            obAjax._error(xhttp, xhttp.status, xhttp.responseText);
    }

    xhttp.open(obAjax._type || "GET", path);
    if (POST) {
        if (obAjax._dataType !== false) xhttp.setRequestHeader("Data-type", obAjax._dataType || 'json');
        if (obAjax._contentType !== false)
            xhttp.setRequestHeader("Content-type",
        		obAjax._contentType || 'application/x-www-form-urlencoded; charset=UTF-8');
        xhttp.send(_arguments);
    } else xhttp.send();
};

/*
Parametros:
	obj: Objeto enviado;
Retorno: (String) O tipo do objeto em minúsuculo;
*/
//Pega o tipo do objeto mandado
var getType = (obj) => ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

/*
Parametros:
	obj: Objeto com as configurações do processamento:
		_percent: (String) Id da barra de progresso a ser atualizada durante o processamento;
		_array: (Array) Array a ser processado;
		_length: (Int) Tamanho do array enviado;
		_process: (Function) Função que na qual os elementos do array serão processados;
		_done: (Function) Função a ser executada após o término do processamento;
*/
//Processa array usando setTimeout
function processArray(obj) {
    setTimeout(function () {
        if (obj._percent)
            renderizaPorcentagem(obj._percent, 100 - ((obj._array.length * 100) / obj._length));
        (obj._array.splice(0, Math.ceil(obj._length * 0.1))).forEach(x => obj._process(x));
        if (obj._array.length > 0)
            setTimeout(processArray(obj));
        else if (obj._done)
            obj._done();
    });
};

/*
Parametros:
	array1: (Array) Primeiro array;
	array2: (Array) Segundo array;
Retorno: (Array) Array contendo a diferença entre os dois arrays enviados;
*/
//Retorna a diferença entre dois arrays.
function diferencaArrays(array1, array2) {
    var menor, maior = array1.length > array2.length ? (menor = array2, array1) : (menor = array1, array2);
    return maior.filter(key => menor.indexOf(key) === -1);
};

/*
Parametros:
	array: (Array) Array a ser embaralhado;
Retorno: (Array) Array embaralhado;
*/
//Embaralha array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // Enquanto ainda estiver elementos para ordenar...
    while (0 !== currentIndex) {

        // Pegue um elemento faltando...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // E troca pelo elemento atual.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

//CORES
/* Retorno: (String) Uma cor randomica em Hexadecimal; */
//Devolve uma cor randomica em Hexadecimal
var randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
/* Parametros: h: (String) Cor em Hexadecimal;
   Retorno: (String) Cor em Hexadecimal sem o caractere '#'; */
//Corta Cor em Hexadecimal
var cutHex = h => (h.charAt(0) == "#") ? h.substring(1, 7) : h;
/* Parametros: h: (String) Cor em Hexadecimal;
   Retorno: (Int) R da cor enviada; */
//Pega o R da Cor em Hexadecimal
var HexToR = h => parseInt((cutHex(h)).substring(0, 2), 16);
/* Parametros: h: (String) Cor em Hexadecimal;
   Retorno: (Int) G da cor enviada; */
//Pega o G da Cor em Hexadecimal
var HexToG = h => parseInt((cutHex(h)).substring(2, 4), 16);
/* Parametros: h: (String) Cor em Hexadecimal;
   Retorno: (Int) B da cor enviada; */
//Pega o B da Cor em Hexadecimal
var HexToB = h => parseInt((cutHex(h)).substring(4, 6), 16);

/*
Parametros:
	selection: (Array) Array de elementos a serem buscados;
	el: (String OU Number) elemento a ser buscado;
	att: (String) Atributo de comparação entre os elementos do array,
			se não for enviada então a regra será comparar elemento por elemento;
Retorno: (Array) Array com os elementos filtrados pela busca;
*/
//Retorna lista com itens contidos na lista recebida de acordo com a string recebida.
var search = (selection, el, att) =>
    selection.filter((d) => (att ? d[att] : d).toUpperCase().indexOf(el.toUpperCase()) != -1);

/*
Parametros:
	fun: (Function) Regra para separar elementos únicos no array,
			se não for enviada então a regra será comparar elemento por elemento;
	map: (Boolean) Se for verdadeiro então retornará o array resultado da regra enviada,
			se não então retornára o próprio array com elementos únicos;
Retorno: (Array) O próprio array com elementos únicos de acordo com a regra enviada;
*/
//Traz um array de elementos únicos
Array.prototype.unique = function (fun, map) {
    fun = fun || (c => c);
    var arrayUnique = [this[0]], arrayUniqueAtt = [fun(this[0])];
    for (var i = 1; i < this.length; ++i) {
        if (arrayUniqueAtt.indexOf(fun(this[i])) === -1) {
            arrayUniqueAtt.push(fun(this[i]));
            arrayUnique.push(this[i]);
        }
    }
    return map ? arrayUniqueAtt : arrayUnique;
};

/*
Parametros:
	element: Elemento ou sequência de elementos a ser verificado;
Retorno: (Boolean) Se o elemento enviado está no próprio array;
*/
//Verifica se o elemento está no array
Array.prototype.contains = function (element) {
    if (getType(element) === "array") {
        for (var i = 0; i < element.length; i++) {
            if (this.indexOf(element[i]) === -1)
                return false;
        }
        return true;
    } else
        return this.indexOf(element) !== -1;
};

/* Retorno: (String) O nome do browser atual; */
//Pega o browser atual
function getBrowser() {
    if (window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
        return "opera";
    if (typeof InstallTrigger !== 'undefined') // Firefox 1.0+
        return "firefox";
    if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
        // At least Safari 3+: "[object HTMLElementConstructor]"
        return "safari";
    if (window.chrome) // Chrome 1+
        return "chrome";
    if (document.documentMode) // At least IE6
        return "ie";
};

// REMOVE ACENTOS
/*
   Copyright 2015 rdllopes http://stackoverflow.com/users/1879686/rdllopes from http://stackoverflow.com/questions/990904/javascript-remove-accents-diacritics-in-strings
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var diacriticsMap = [
    { 'base': 'A', 'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
    { 'base': 'AA', 'letters': '\uA732' },
    { 'base': 'AE', 'letters': '\u00C6\u01FC\u01E2' },
    { 'base': 'AO', 'letters': '\uA734' },
    { 'base': 'AU', 'letters': '\uA736' },
    { 'base': 'AV', 'letters': '\uA738\uA73A' },
    { 'base': 'AY', 'letters': '\uA73C' },
    { 'base': 'B', 'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
    { 'base': 'C', 'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
    { 'base': 'D', 'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779' },
    { 'base': 'DZ', 'letters': '\u01F1\u01C4' },
    { 'base': 'Dz', 'letters': '\u01F2\u01C5' },
    { 'base': 'E', 'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
    { 'base': 'F', 'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
    { 'base': 'G', 'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
    { 'base': 'H', 'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
    { 'base': 'I', 'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
    { 'base': 'J', 'letters': '\u004A\u24BF\uFF2A\u0134\u0248' },
    { 'base': 'K', 'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
    { 'base': 'L', 'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
    { 'base': 'LJ', 'letters': '\u01C7' },
    { 'base': 'Lj', 'letters': '\u01C8' },
    { 'base': 'M', 'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
    { 'base': 'N', 'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
    { 'base': 'NJ', 'letters': '\u01CA' },
    { 'base': 'Nj', 'letters': '\u01CB' },
    { 'base': 'O', 'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
    { 'base': 'OI', 'letters': '\u01A2' },
    { 'base': 'OO', 'letters': '\uA74E' },
    { 'base': 'OU', 'letters': '\u0222' },
    { 'base': 'OE', 'letters': '\u008C\u0152' },
    { 'base': 'oe', 'letters': '\u009C\u0153' },
    { 'base': 'P', 'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
    { 'base': 'Q', 'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
    { 'base': 'R', 'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
    { 'base': 'S', 'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
    { 'base': 'T', 'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
    { 'base': 'TZ', 'letters': '\uA728' },
    { 'base': 'U', 'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
    { 'base': 'V', 'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
    { 'base': 'VY', 'letters': '\uA760' },
    { 'base': 'W', 'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
    { 'base': 'X', 'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
    { 'base': 'Y', 'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
    { 'base': 'Z', 'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
    { 'base': 'a', 'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
    { 'base': 'aa', 'letters': '\uA733' },
    { 'base': 'ae', 'letters': '\u00E6\u01FD\u01E3' },
    { 'base': 'ao', 'letters': '\uA735' },
    { 'base': 'au', 'letters': '\uA737' },
    { 'base': 'av', 'letters': '\uA739\uA73B' },
    { 'base': 'ay', 'letters': '\uA73D' },
    { 'base': 'b', 'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
    { 'base': 'c', 'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
    { 'base': 'd', 'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
    { 'base': 'dz', 'letters': '\u01F3\u01C6' },
    { 'base': 'e', 'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
    { 'base': 'f', 'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
    { 'base': 'g', 'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
    { 'base': 'h', 'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
    { 'base': 'hv', 'letters': '\u0195' },
    { 'base': 'i', 'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
    { 'base': 'j', 'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
    { 'base': 'k', 'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
    { 'base': 'l', 'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
    { 'base': 'lj', 'letters': '\u01C9' },
    { 'base': 'm', 'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
    { 'base': 'n', 'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
    { 'base': 'nj', 'letters': '\u01CC' },
    { 'base': 'o', 'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
    { 'base': 'oi', 'letters': '\u01A3' },
    { 'base': 'ou', 'letters': '\u0223' },
    { 'base': 'oo', 'letters': '\uA74F' },
    { 'base': 'p', 'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
    { 'base': 'q', 'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
    { 'base': 'r', 'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
    { 'base': 's', 'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
    { 'base': 't', 'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
    { 'base': 'tz', 'letters': '\uA729' },
    { 'base': 'u', 'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
    { 'base': 'v', 'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
    { 'base': 'vy', 'letters': '\uA761' },
    { 'base': 'w', 'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
    { 'base': 'x', 'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
    { 'base': 'y', 'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
    { 'base': 'z', 'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' }
].reduce(function(obj, item){
	item.letters.split("").forEach((l) => obj[l] = item.base);
	return obj;
}, {});

// "what?" version ... http://jsperf.com/diacritics/12
var removeDiacritics = (str) => str.replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a);



/////////////////////////////////////////////ELEMENTS//////////////////////////////////////////////


/*
Retorno: (Array) A própria coleção mas em array;
*/
//Transforma a coleção de elementos em um array de elementos
HTMLCollection.prototype.toArray = function () { return Array.prototype.slice.call(this); };
NodeList.prototype.toArray = function () { return Array.prototype.slice.call(this); };

/*
Parametros:
	className: (String) Classe a ser verificada;
Retorno: (Boolean) Se o próprio elemento possui classe enviada;
*/
//Verifica se elemento possui a classe enviada
Element.prototype.hasClass = function (className) {
    return this.className.split(" ").indexOf(className) > -1;
};

Element.prototype.addClass = function (className) {
    var arr = this.className.split(" ");
    arr.push(className);
    this.className = arr.join(" ");
    return this;
};

Element.prototype.removeClass = function (className) {
    className = className.split(" ");
    var arr = this.className.split(" ").filter(c => className.indexOf(c) === -1);
    this.className = arr.join(" ");
    return this;
};

Element.prototype.toggleAttribute = function (att, content) {
    if (content === undefined || content === false)
        this.removeAttribute(att);
    else
        this.setAttribute(att, content);
    return this;
};

//Configura o elemento de acordo com o objeto mandado
Element.prototype.config = function (content) {
    var element = this;
    Object.keys(content).forEach(function (att) {
        if (getType(content[att]) === "object")
            Object.keys(content[att]).forEach(att2 => element[att][att2] = content[att][att2]);
        else
            switch (att[0]) {
                case "F":
                    element.addEventListener(att.substr(1), content[att]);
                    break;
                case "S":
                    element.style[att.substr(1)] = content[att];
                    break;
                case "A":
                    element.setAttribute(att.substr(1), content[att]);
                    break;
                default:
                    element[att] = content[att];
                    break;
            }
    });
    return element;
};

//APPEND SEM JQUERY
Element.prototype.append = function (element) {
    this.appendChild(element);
    return this;
};

//Pega o attributo do DOM
Element.prototype.getDOMAttribute = function (element) { return this[element]; };

//Esvazia o Elemento
Element.prototype.empty = function () {
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
    return this;
};

//Pega os elementos de acordo com o seletor enviado
Element.prototype.getElement = function (selector) {
    return getElement(selector, this);
};

//Pega os elementos de acordo com o seletor enviado
function getElement(selector, element, include) {
    //console.log(selector);
    if (!selector.length) return element;
    element = element || document;
    var auxFunc, auxFilter, operatorAux = "", funcGetAtt = "",
        selectors = (getType(selector) === "array") ? selector :
                            selector.replace(/#/g, ",#").replace(/\./g, ",.").replace(/:/g, ",:")
                            .replace(/\+/g, ",+").replace(/&/g, ",&,").split(",").filter(s => s),
        item = selectors.shift();
    switch (item[0]) {
        case '&': return getElement(selectors, element, true);
        case '#': return getElement(selectors, element.getElementById(item.substr(1)));
        case '+':
            item = item.substr(1);
            funcGetAtt = (item[0] === '!') ? (item = item.substr(1), "getDOMAttribute") : "getAttribute";
            item = item.replace(/=/g, ",=,").replace(/</g, ",<,").replace(/>/g, ",>,").split(",")
                .reduce(function (arr, el) {
                    operatorAux = (el) ? (arr.push(operatorAux + el), "") : arr.pop();
                    return arr;
                }, []);
            switch (item[1]) {
                case "=": auxFilter = el => el[funcGetAtt](item[0]) == item[2]; break;
                case "<": auxFilter = el => parseFloat(el[funcGetAtt](item[0])) < parseFloat(item[2]); break;
                case ">": auxFilter = el => parseFloat(el[funcGetAtt](item[0])) > parseFloat(item[2]); break;
                case "<=": auxFilter = el => parseFloat(el[funcGetAtt](item[0])) <= parseFloat(item[2]); break;
                case ">=": auxFilter = el => parseFloat(el[funcGetAtt](item[0])) >= parseFloat(item[2]); break;
                case undefined: default: auxFilter = el => el[funcGetAtt](item[0]); break;
            }
            if (element === document)
                element = element.getElementsByTagName("*").toArray();
            auxFunc = el => el.children.toArray().filter(auxFilter);
            break;
        case '.':
            item = item.substr(1);
            auxFilter = el => el.className.split(" ").contains(item.split(" "));
            auxFunc = el => el.getElementsByClassName(item).toArray();
            break;
        case ':':
            item = item.substr(1).toLowerCase();
            auxFilter = el => el.tagName.toLowerCase() === item;
            auxFunc = el => el.getElementsByTagName(item).toArray();
            break;
        default:
            auxFilter = el => el.name === item;
            auxFunc = el => el.getElementsByName(item).toArray();
            break;
    }
    return getElement(selectors, (include) ? element.filter(auxFilter) :
            (getType(element) === "array") ?
            	element.reduce((aux, el) => aux.concat(auxFunc(el)), []) : auxFunc(element));
};

var showObject = {
    valueShowBool: false,
    sameElement: {}
};
/*
Parametros:
	element: (String OU HtmlElement) String com o id do elemento OU Elemento a ser mostrado ou escondido;
	value:   (Boolean) Valor para esconder ou mostrar o Elemento, 
				se não for mandado então o método retorna o display do Elemento enviado;
	delay:   (Number) Tempo em ms para mostrar ou esconder o Elemento;
*/
//Mostra ou esconde elementos
function show(element, value, delay) {
    showObject.valueShowBool = value;
    element = (getType(element) === "string") ?
    			document.getElementById(element) : element;
    showObject.sameElement = element;
    if (value === undefined)
        return element.style.display;
    if (delay === undefined)
        element.style.display = value ? 'block' : 'none';
    else {
        showObject.sameElement = {};
        var op = showObject.valueShowBool ? 0.1 : 1;  // initial opacity
        var timer = setInterval(function () {
            element.style.display = value ? 'block' : 'none';
            if (op > 1 || op < 0.1) {
                clearInterval(timer);
                element.style.display = value ? 'block' : 'none';
            } else if (showObject.sameElement.id === element.id) {
                clearInterval(timer);
                element.style.display = showObject.valueShowBool ? 'block' : 'none';
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op = op + (op * 0.1) * (value ? 1 : -1);
        }, delay);
    }
};

/*
Parametros:
	el: (String) Tag do elemento a ser criado ('DIV', 'LABEL', 'SPAN', ...);
*/
//Cria um elemento HTML novo
var createElement = (el) => document.createElement(el);

//Renderiza porcentagem do bootstrap
var renderizaPorcentagem = (idProcess, value) =>
    document.getElementById(idProcess).config({
        Swidth: value + "%", innerHTML: Math.round(value) + "%", "aria-valuenow": value
    });

//Pega o id do radio button selecionado de um grupo
var getCheckedRadioId = name =>
    document.getElementsByName(name).toArray().filter(x => x.checked)[0].id;

//Pega todos os ids dos radio buttons selecionados de uma div
var getAllCheckedRadioId = div => getElement("#" + div + ":input").reduce(function (array, element) {
    if (element.checked)
        array.push(element.id);
    return array;
}, []);

//Pega o layout de outra página
function getLayout(path, conatiner, fDone) {
    window.onload = function () {
        var container = document.documentElement.innerHTML;
        AjaxPuro({
            _path: path,
            _done: function (data) {
                document.documentElement.innerHTML = data;
                document.getElementById(conatiner).innerHTML = container;
                if (fDone)
                    fDone();
            },
            _error: function (request, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
            }
        });
    };
};

//MODALS
var XModal = {
	divNone: document.createElement("DIV").config({ Sdisplay: "none" }),
};
XModal.create = function(id, modalConfig) {
    var closeModal = () => XModal.toggleModal(id, false);

    modalConfig = modalConfig || {};;
    modalConfig._XBtn = modalConfig._XBtn === false ? XModal.divNone :
        document.createElement('BUTTON').config({ className: "close", Fclick: closeModal, innerHTML: "X" });

    modalConfig._head = modalConfig._head || XModal.divNone;
    modalConfig._body = modalConfig._body || XModal.divNone;
    modalConfig._foot = modalConfig._foot === undefined ?
        document.createElement('BUTTON').config({ className: "btn btn-default", Fclick: closeModal, innerHTML: "Fechar" }) :
        modalConfig._foot || XModal.divNone;

    document.getElementsByTagName("body")[0]
        .append(document.createElement('DIV').config({ id: id, className: "modal fade" })
            .append(document.createElement('DIV').addClass("modal-dialog")
                .append(document.createElement('DIV').addClass("modal-content " + (modalConfig._contentClass || ""))
                    .append(document.createElement('DIV').config(modalConfig._configHead || {}).addClass("modal-header")
                        .append(modalConfig._XBtn)
                        .append(document.createElement('h4').config(modalConfig._configTitle || {}).addClass("modal-title"))
                        .append(modalConfig._head))
                    .append(document.createElement('DIV').config(modalConfig._configBody || {}).addClass("modal-body")
                    	.append(modalConfig._body))
                    .append(document.createElement('DIV').config(modalConfig._configFoot || {}).addClass("modal-footer")
                    	.append(modalConfig._foot)))));
};
XModal.confirm = function(text, func) {
    if (!getElement("#confirmModal"))
    	XModal.create("confirmModal", {
        	_XBtn: false,
        	_configHead: { Sdisplay: "none" },
       		_body: document.createElement("DIV").config({ innerHTML: text }),
        	_foot: document.createElement('DIV')
              .append(document.createElement('BUTTON').config({
                  className: "btn btn-default", Fclick: function () {
                      func(true); XModal.toggleModal("confirmModal", false);
                  }, innerHTML: "OK"
              }))
              .append(document.createElement('BUTTON').config({
                  className: "btn btn-default", Fclick: function () {
                      func(false); XModal.toggleModal("confirmModal", false);
                  }, innerHTML: "Cancela"
              }))
    	});

    XModal.toggleModal("confirmModal", true, { _clickOut: false });
};
XModal.toggleModal = function(id, content, modalConfig) {
    modalConfig = modalConfig || {};
    var element = document.getElementById(id),
        divBackdrop = document.getElementsByClassName("modal-backdrop fade in")[0];
    if (!element) return;
    show(element[(content ? "add" : "remove") + "Class"]("in"), content, modalConfig._delay || 3);
    if (modalConfig._clickOut !== false)
        document.body[(content ? "add" : "remove") + "EventListener"]('click', XModal.clickOutsideModal);

    if (content) {
        if (!divBackdrop)
            document.getElementsByTagName("body")[0].appendChild(document.createElement("DIV").addClass("modal-backdrop fade in"));
    } else {
        if (element.onHideModal) element.onHideModal();
        if (divBackdrop) divBackdrop.remove();
    }
};
XModal.clickOutsideModal = function(e) {
    if (e.target.className.indexOf("modal fade in") !== -1)
        XModal.toggleModal(e.target.id, false);
};


//TITLE PERSONALIZADO
var XTitle = {
    titleName: "",
    titleEl: null,
    titleDelay: 0
};
XTitle.iniciaTitle = function (titleConfig) {
    titleConfig = titleConfig || {};
    var style = {
        padding: "3px",
        border: "1px solid #666",
        "border-right-width": "2px",
        "border-bottom-width": "2px",
        background: "#003459",
        color: "#FFF",
        font: "bold 9px Verdana, Arial, Helvetica, sans-serif",
        "text-align": "left",
        position: "absolute",
        "z-index": 1000
    };
    if (titleConfig._style) Object.keys(titleConfig._style).forEach(att => style[att] = titleConfig._style[att]);

    XTitle.titleDelay = titleConfig._delay || 20;
    XTitle.titleName = titleConfig._name || "personalizeTitle";
    XTitle.titleEl = document.getElementById(XTitle.titleName) ||
        document.getElementsByTagName("body")[0].appendChild(document.createElement("div").config({
            id: XTitle.titleName, style: style
        }));

    var getPlace = evt => XTitle.titleEl.config({
        style: { left: (evt.pageX + 12) + "px", top: (evt.pageY + 20) + "px" }
    });
    document.onmousemove = getPlace;
    document.addEventListener(getBrowser() !== "firefox" ? "mousewheel" : "DOMMouseScroll", getPlace, false);
    XTitle.refreshTitle();
};
XTitle.refreshTitle = function () {
    show(XTitle.titleEl, false);
    getElement("+title").forEach(function (el) {
        el.setAttribute(XTitle.titleName, el.title);
        el.removeAttribute("title");
        el.onmouseover = function () { XTitle.showTitle(el.getAttribute(XTitle.titleName)) };
        el.onmouseout = function () { XTitle.showTitle() };
    });

    var parent;
    document.getElementsByTagName("title").toArray().forEach(function (el) {
        parent = el.parentElement;
        if (parent.tagName !== "HEAD") {
            parent.setAttribute(XTitle.titleName, el.innerHTML);
            el.remove();
            parent.onmouseover = function () {
                XTitle.showTitle(parent.getAttribute(XTitle.titleName))
            };
            parent.onmouseout = function () { XTitle.showTitle() };
        }
    });
};
XTitle.showTitle = function (text) {
    text ? show(XTitle.titleEl, true, XTitle.titleDelay) : show(XTitle.titleEl, false);
    XTitle.titleEl.config({ innerHTML: text || "" });
};
