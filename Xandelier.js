"use strict";
////////////////////////////////////////////PROTOTYPES//////////////////////////////////////////////
{
    /* Retorno: (Array) A própria coleção mas em array; */
    HTMLCollection.prototype.toArray = 
    NodeList.prototype.toArray = function () {
        var arr = [], i;
        for (i = 0; i < this.length; i++)
            arr.push(this[i]);
        return arr;
    };
    
    /*
    Parametros:
        className: (String) Classe a ser verificada;
    Retorno: (Boolean) Se o próprio elemento possui classe enviada;
    */
    Element.prototype.hasClass = function (className) {
        return this.className.split(" ").indexOf(className) > -1;
    };
    
    /*
    Parametros:
        className: (String) Classe a ser adicionada;
    Retorno: (Element) Elemento;
    */
    Element.prototype.addClass = function (className) {
        this.className = this.className.concat(` ${className}`);
        return this;
    };
    
    /*
    Parametros:
        className: (String) Classe a ser removida;
    Retorno: (Element) Elemento;
    */
    Element.prototype.removeClass = function (className) {
        var arrClassName = className.split(" "),
            arr = this.className.split(" ").filter(c => arrClassName.indexOf(c) === -1);
        this.className = arr.join(" ");
        return this;
    };
    
    /*
    Parametros:
        att: (String) Atributo a ser adicionado ou removido;
        content: Conteúdo do atributo,
            se não for enviado ou enviado como false irá remover o atributo;
    Retorno: (Element) Elemento;
    */
    Element.prototype.toggleAttribute = function (att, content) {
        if (content === undefined || content === false)
            this.removeAttribute(att);
        else
            this.setAttribute(att, content);
        return this;
    };
    
    /*
    Parametros:
        content: (Objeto) Objeto com as configurações do Elemento:
            Para adicionar um evento o nome do atributo deve ser 'F' + nome_do_evento e o conteúdo deve ser a função do evento;
            Para adicionar um estilo o nome do atributo deve ser 'S' + nome_do_estilo e o conteúdo deve ser o valor do estilo;
            Para adicionar um atributo do DOM o nome do atributo deve ser 'A' + nome_do_atributo e o conteúdo deve ser o valor do atributo;
            Para adicionar multiplos itens o nome do atributo deve ser o nome da função\atributo que adiciona eles (como 'addEventListener', 'style' e 'setAttribute') 
                e o conteúdo deve ser um objeto onde o atributo deve ser o nome do item a ser adicionado e o conteúdo deve ser o conteúdo desse item;
            Para adicionar um atributo apenas envie o seu próprio nome e conteúdo;  
    Retorno: (Element) Elemento;
    */
    Element.prototype.config = function (content) {
        var element = this;
        Object.keys(content).forEach(function (att) {
            if (typeof content[att] === "object") {
                if(!element[att]) element[att] = {};
                Object.keys(content[att]).forEach(function(att2){
                    if (typeof element[att] === "function")
                        element[att](att2, content[att][att2])
                    else                
                        element[att][att2] = content[att][att2];
                });
            } else
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
    
    /*
    Parametros:
        att: (Element) Elemento que será inserido;
    Retorno: (Element) Elemento pai;
    */
    Element.prototype.append = function (element) {
        this.appendChild(element);
        return this;
    };
    
    /*
    Parametros:
        att: (String) Nome do atributo requisitado;
    Retorno: Attributo do DOM;
    */
    Element.prototype.getVDOMAttribute = function (att) {
        return this[att];
    };
    
    /*
    Retorno: (Element) O Elemento enviado vazio;
    */
    //Esvazia o Elemento
    Element.prototype.empty = function () {
        while (this.firstChild)
            this.removeChild(this.firstChild);
        return this;
    };
    
    //Pega os elementos de dentro do Elemento de acordo com o seletor enviado
    Element.prototype.getElement = function (selector) {
        return X(selector, this);
    };
    
    /*
    Parametros:
        fun: (Function) Regra para separar elementos únicos no array,
                se não for enviada então a regra será comparar elemento por elemento;
        map: (Boolean) Se for verdadeiro então retornará o array resultado da regra enviada,
                se não então retornára o próprio array com elementos únicos;
    Retorno: (Array) O próprio array com elementos únicos de acordo com a regra enviada;
    */
    Array.prototype.unique = function (fun, map) {
        fun = fun || (c => c);
        var arrayUnique = [this[0]], 
            arrayUniqueAtt = [fun(this[0])];
        this.forEach(function(el){
            if (arrayUniqueAtt.indexOf(fun(el)) === -1) {
                arrayUniqueAtt.push(fun(el));
                arrayUnique.push(el);
            }
        });
        return map ? arrayUniqueAtt : arrayUnique;
    };
    
    /*
    Parametros:
        element: Elemento ou sequência de elementos a ser verificado;
    Retorno: (Boolean) Se o elemento enviado está no próprio array;
    */
    Array.prototype.contains = function (element) {
        var elementArray = this;
        switch(X.TypeOf(element)) {
            case "object": return element.Object.keys(content).filter((att) => elementArray.indexOf(element[att]) === -1).length;
            case "array": return element.filter((el) => elementArray.indexOf(el) === -1).length;
            default: return this.indexOf(element) !== -1;
        };
        return false;
    };
    
    /*
    Parametros:
        el: (String OU Float) Elemento a ser buscado;
        objSearch: (Objeto) Objeto com as configurações do ajax:
            _att: (String) Atributo de comparação entre os elementos do array,
                    se não for enviada então a regra será comparar elemento por elemento;
            _diacriticsInsensitive: (Boolean) Valor que indica se na comparação de strings não irá desconsiderar os acentos;
            _caseInsensitive: (Boolean) Valor que indica se na comparação de strings não será Case Sensitive;
    Retorno: (Array) Array com os elementos filtrados pela busca;
    */
    Array.prototype.search = function(el, objSearch){
        var elType = typeof el, 
            stringFun = function(str) {
                if(!objSearch._diacriticsInsensitive) str = str.removeDiacritics();
                if(!objSearch._caseInsensitive) str = str.toUpperCase();
                return str;
            };
        return this.filter(function(d){
            d = (objSearch._att ? d[objSearch._att] : d);
            switch(elType){
                case "number": return d === el;
                case "string": return stringFun(d).indexOf(stringFun(el)) !== -1;
            }
            return false;
        });
    };
    
    /* Retorno: (Array) Array contendo a diferença entre os dois arrays enviados; */
    Array.prototype.difference = function(array) {
        var smaller, 
            larger = this.length > array.length ? 
                (smaller = array, this) : 
                (smaller = this, array);
        return larger.filter(key => smaller.indexOf(key) === -1);
    };
    
    /* Retorno: (Array) Array embaralhado; */
    Array.prototype.shuffle = function() {
        var currentIndex = this.length, temporaryValue, randomIndex;
    
        //Enquanto ainda estiver elementos para ordenar
        while (0 !== currentIndex) {
            //Pegue um elemento faltando
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
    
            //Troca pelo elemento atual
            temporaryValue = this[currentIndex];
            this[currentIndex] = this[randomIndex];
            this[randomIndex] = temporaryValue;
        }
    
        return this;
    };

    /* Retorno: (String) String sem acentos; */
    String.prototype.removeDiacritics = (function(){
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
            { base: 'A', letters: '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
            { base: 'AA', letters: '\uA732' },
            { base: 'AE', letters: '\u00C6\u01FC\u01E2' },
            { base: 'AO', letters: '\uA734' },
            { base: 'AU', letters: '\uA736' },
            { base: 'AV', letters: '\uA738\uA73A' },
            { base: 'AY', letters: '\uA73C' },
            { base: 'B', letters: '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
            { base: 'C', letters: '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
            { base: 'D', letters: '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779' },
            { base: 'DZ', letters: '\u01F1\u01C4' },
            { base: 'Dz', letters: '\u01F2\u01C5' },
            { base: 'E', letters: '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
            { base: 'F', letters: '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
            { base: 'G', letters: '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
            { base: 'H', letters: '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
            { base: 'I', letters: '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
            { base: 'J', letters: '\u004A\u24BF\uFF2A\u0134\u0248' },
            { base: 'K', letters: '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
            { base: 'L', letters: '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
            { base: 'LJ', letters: '\u01C7' },
            { base: 'Lj', letters: '\u01C8' },
            { base: 'M', letters: '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
            { base: 'N', letters: '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
            { base: 'NJ', letters: '\u01CA' },
            { base: 'Nj', letters: '\u01CB' },
            { base: 'O', letters: '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
            { base: 'OI', letters: '\u01A2' },
            { base: 'OO', letters: '\uA74E' },
            { base: 'OU', letters: '\u0222' },
            { base: 'OE', letters: '\u008C\u0152' },
            { base: 'oe', letters: '\u009C\u0153' },
            { base: 'P', letters: '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
            { base: 'Q', letters: '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
            { base: 'R', letters: '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
            { base: 'S', letters: '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
            { base: 'T', letters: '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
            { base: 'TZ', letters: '\uA728' },
            { base: 'U', letters: '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
            { base: 'V', letters: '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
            { base: 'VY', letters: '\uA760' },
            { base: 'W', letters: '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
            { base: 'X', letters: '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
            { base: 'Y', letters: '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
            { base: 'Z', letters: '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
            { base: 'a', letters: '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
            { base: 'aa', letters: '\uA733' },
            { base: 'ae', letters: '\u00E6\u01FD\u01E3' },
            { base: 'ao', letters: '\uA735' },
            { base: 'au', letters: '\uA737' },
            { base: 'av', letters: '\uA739\uA73B' },
            { base: 'ay', letters: '\uA73D' },
            { base: 'b', letters: '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
            { base: 'c', letters: '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
            { base: 'd', letters: '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
            { base: 'dz', letters: '\u01F3\u01C6' },
            { base: 'e', letters: '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
            { base: 'f', letters: '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
            { base: 'g', letters: '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
            { base: 'h', letters: '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
            { base: 'hv', letters: '\u0195' },
            { base: 'i', letters: '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
            { base: 'j', letters: '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
            { base: 'k', letters: '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
            { base: 'l', letters: '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
            { base: 'lj', letters: '\u01C9' },
            { base: 'm', letters: '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
            { base: 'n', letters: '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
            { base: 'nj', letters: '\u01CC' },
            { base: 'o', letters: '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
            { base: 'oi', letters: '\u01A3' },
            { base: 'ou', letters: '\u0223' },
            { base: 'oo', letters: '\uA74F' },
            { base: 'p', letters: '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
            { base: 'q', letters: '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
            { base: 'r', letters: '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
            { base: 's', letters: '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
            { base: 't', letters: '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
            { base: 'tz', letters: '\uA729' },
            { base: 'u', letters: '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
            { base: 'v', letters: '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
            { base: 'vy', letters: '\uA761' },
            { base: 'w', letters: '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
            { base: 'x', letters: '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
            { base: 'y', letters: '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
            { base: 'z', letters: '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' }
        ].reduce(function (obj, item) {
            item.letters.split("").forEach((l) => obj[l] = item.base);
            return obj;
        }, {});
        // "what?" version... http://jsperf.com/diacritics/12
        return function() {
            return this.replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a);
        };
    })();
}

var X, Xand, Xandelier;
 X = Xand = Xandelier = (function () {
    var X;
    /////////////////////////////////////////////ELEMENTS//////////////////////////////////////////////
    {
        X = (function () {
            var initialElement = null,
                selectorMapper = { 
                    ID: '#',    CHILDREN: '>', PRECEDED: '~', OR: '|',  ALLELEMENTS: ' ', VDOM: '%', 
                    CLASS: '.', PARENT: '<',   SUCEDED: '+',  AND: ',', NOT: '!',         NAME: '_' 
                },
                regexQuery = new RegExp(`[\\w\\-]+|\\*|\\${selectorMapper.ID}|\\${selectorMapper.CLASS}|\\[\\${selectorMapper.VDOM}?[\\w\\s\\-\\<\\>\\~\\!\\|\\^\\$\\*\\=]+\\]|\\${selectorMapper.NAME}|\\${selectorMapper.ALLELEMENTS}|\\${selectorMapper.OR}|\\${selectorMapper.NOT}|\\${selectorMapper.AND}|\\${selectorMapper.CHILDREN}|\\${selectorMapper.PARENT}|\\${selectorMapper.SUCEDED}|\\${selectorMapper.PRECEDED}`, 'g'),
                /* /[\w\-]+|\*|\#|\.|\[\%?[\w\s\-\<\>\=]+\]|\_|\ |\||\!|\,|\>|\<|\+|\~/g */
                regexAttOp = new RegExp(`[\\w\\s\\-]+|[\\<\\>\\~\\!\\|\\^\\$\\*\\=]+|\\[|\\${selectorMapper.VDOM}|\\]`, 'g'),
                /* /[\w\s\-]+|[\<\>\~\!\^\$\*\=]+|\[|\%|\]/g */
                funcGetAtt = "", funcExec = null, funcFilter = null, isDocument = true,
                item = null, _configNot = false,
                funcExecAtt = (el) => el.getElementsByTagName("*").toArray().filter(funcFilter),
                mapFilters = {
                    '=':       el => ((el[funcGetAtt](item[0]) == item[2]) ^ _configNot),
                    '<':       el => ((parseFloat(el[funcGetAtt](item[0])) < parseFloat(item[2])) ^ _configNot),
                    '>':       el => ((parseFloat(el[funcGetAtt](item[0])) > parseFloat(item[2])) ^ _configNot),
                    '<=':      el => ((parseFloat(el[funcGetAtt](item[0])) <= parseFloat(item[2])) ^ _configNot),
                    '>=':      el => ((parseFloat(el[funcGetAtt](item[0])) >= parseFloat(item[2])) ^ _configNot),
                    '!=':      el => ((el[funcGetAtt](item[0]) != item[2]) ^ _configNot),
                    '~=':      el => ((el[funcGetAtt](item[0]) || "").split(" ").contains(item[2]) ^ _configNot),
                    '|=':      el => (((el[funcGetAtt](item[0]) || "").indexOf(item[2] + '-') > -1) ^ _configNot),
                    '^=':      el => ((el[funcGetAtt](item[0]) || "").startsWith(item[2]) ^ _configNot),
                    '$=':      el => ((el[funcGetAtt](item[0]) || "").endsWith(item[2]) ^ _configNot),
                    '*=':      el => (((el[funcGetAtt](item[0]) || "").indexOf(item[2]) > -1) ^ _configNot),
                    'hasAtt':  el => (!!el[funcGetAtt](item[0]) ^ _configNot),
                    '.':       el => (el.hasClass(item) ^ _configNot),
                    '_':       el => ((el.name === item) ^ _configNot),
                    'tagName': el => ((el.tagName.toLowerCase() === item) ^ _configNot)
                }, 
                mapExec = {
                    '=': funcExecAtt,  '<': funcExecAtt,  '>': funcExecAtt,  '<=': funcExecAtt, '>=': funcExecAtt, 'hasAtt': funcExecAtt,
                    '!=': funcExecAtt, '~=': funcExecAtt, '|=': funcExecAtt, '^=': funcExecAtt, '$=': funcExecAtt, '*=': funcExecAtt, 
                    '.': el => el.getElementsByClassName(item).toArray(),
                    '_': el => (isDocument) ? el.getElementsByName(item).toArray() :
                                el.reduce((array, e) => array.concat(getElementCore("[name=" + item + "]", e)), []),
                    'tagName': el => el.getElementsByTagName(item).toArray()
                },
                getElementCore;

                mapExec[selectorMapper.CLASS] = 
                mapExec[selectorMapper.NAME] = 

                getElementCore = function (selectors, elements, config) {
                    try {
                        initialElement = initialElement || (elements = elements || document);
                        if (!selectors.length || !elements) return elements;
                        config = config || {};
                        funcFilter = null;
                        isDocument = (elements === document);
                        if(X.TypeOf(elements) !== "array") elements = [elements];
                        selectors = (typeof selectors === "string") ? selectors.match(regexQuery) : selectors;
                        var selector = selectors.shift(), resultElements;

                        //debugger;
                        switch (selector) {
                            case '*': return getElementCore(selectors, elements.reduce((array, el) => array.concat(el.getElementsByTagName("*").toArray()), []));
                            case selectorMapper.ALLELEMENTS: 
                                config._include = false;
                                return getElementCore(selectors, elements, config);
                            case selectorMapper.NOT:
                                if (isDocument) elements = elements.getElementsByTagName("*").toArray();
                                _configNot = true;
                                return getElementCore(selectors, elements, config);
                            case selectorMapper.ID:       return getElementCore(selectors, document.getElementById(selectors.shift()));
                            case selectorMapper.CHILDREN: return getElementCore(selectors, elements, { _children: true });
                            case selectorMapper.PARENT:   return getElementCore(selectors, elements, { _parent: true });
                            case selectorMapper.SUCEDED:  return getElementCore(selectors, elements, { _suceded: true });
                            case selectorMapper.PRECEDED: return getElementCore(selectors, elements, { _preceded: true });
                            case selectorMapper.AND:      return elements.concat(getElementCore(selectors, initialElement));
                            case selectorMapper.OR:       return (elements.length ? elements : false) || getElementCore(selectors, initialElement);
                            case selectorMapper.CLASS: 
                            case selectorMapper.NAME:     item = selectors.shift(); break;
                            default:
                                if(selector[0] === '['){
                                    item = selector.match(regexAttOp);
                                    item.shift();
                                    funcGetAtt = (item[0] === selectorMapper.VDOM) ? (item.shift(), "getVDOMAttribute") : "getAttribute";
                                    if(item.pop() !== ']') throw "Os conchetes não foram fechados. Ex.: [atributo=valor]";                                  
                                    selector = item[1] || "hasAtt";
                                } else
                                    item = selector.toLowerCase(); 
                                break;
                        };
                        
                        funcFilter = mapFilters[selector] || mapFilters["tagName"];
                        funcExec = mapExec[selector] || mapExec["tagName"];
                        
                        if(config._include)
                            resultElements = elements.filter(funcFilter);
                        else if(config._children)
                            resultElements = elements.reduce((array, el) => array.concat(el.children.toArray().filter(funcFilter)), []);
                        else if(config._parent)
                            resultElements = elements.reduce(function(array, el) {
                                if(funcFilter(el.parentElement))
                                    array.push(el.parentElement);
                                return array;
                            }, []);
                        else if(config._suceded)
                            resultElements = elements.reduce(function(array, el) {
                                while(!el.nextSibling.tagName) el = el.nextSibling;
                                if(funcFilter(el.nextSibling))
                                    array.push(el.nextSibling);
                                return array;
                            }, []);
                        else if(config._preceded)
                            resultElements = elements.reduce(function(array, el) {
                                while(!el.previousSibling.tagName) el = el.previousSibling;
                                if(funcFilter(el.previousSibling))
                                    array.push(el.previousSibling);
                                return array;
                            }, []);
                        else
                            resultElements = elements.reduce((array, el) => array.concat(funcExec(el)), []);
                        _configNot = false;
        
                        return getElementCore(selectors, resultElements, { _include: true });
                    } finally {
                        initialElement = null;
                    }
                };
            return getElementCore;
        })();
        
        /*
        Parametros:
            element: (String OU HtmlElement) String com o id do Elemento OU Elemento a ser mostrado ou escondido;
            show:   (Boolean) Valor para decidir se o Elemento irá ser mostrado ou escondido, 
                        se não for mandado então o método retorna o display do Elemento enviado;
            delay:   (Float) Tempo em ms para mostrar ou esconder o Elemento;
        */
        X.Show = (function () {
            var valueShowBool = false,
                sameElement = {};
            return function (element, show, delay) {
                valueShowBool = show;
                sameElement = element = 
                    typeof element === "string" ? document.getElementById(element) : element;
                
                if (show === undefined) return element.style.display;
                if (delay === undefined) element.style.display = show ? 'block' : 'none';
                else {
                    sameElement = {};
                    var op = valueShowBool ? 0.1 : 1 /*opacidade inicial*/, timer;
                    element.config({ style: { display: (show ? 'block' : 'none'), opacity: op } });
                    timer = setInterval(function () {
                        if (op > 1 || op < 0.1) {
                            clearInterval(timer);
                            element.style.display = show ? 'block' : 'none';
                        } else if (sameElement.id === element.id) {
                            clearInterval(timer);
                            element.style.display = valueShowBool ? 'block' : 'none';
                        }
                        element.config({ style: { opacity: op, filter: 'alpha(opacity=' + op * 100 + ")" } });
                        op = op + (op * 0.1) * (show ? 1 : -1);
                    }, delay);
                }
            };
        })();
            
        /*
        Parametros:
            idProcess: (String OU HtmlElement) String com o id do Progress Bar OU o Progress Bar;
            value: (Float) Porcentagem do Progress Bar;
        Retorno: (Element) Progress Bar;
        */
        X.PercentageRender = function(element, value) {
            element = typeof element === "string" ? document.getElementById(element) : element;
            element.config({
                Swidth: value + "%", innerHTML: Math.round(value) + "%", "Aaria-valuenow": value
            });
            return element;
        };      
                        
        /*
        Parametros:
            layoutPath: (String) Caminho do layout original;
            containerId: (String) Id do container dentro do layout original que será renderizado conteúdo da página atual;
            callback: (Função) Função de callback após renderizar o layout;
        */
        X.SetLayout = function(layoutPath, containerId, callback) {
            var containerContent = document.documentElement.innerHTML, err;
            X.Ajax({
                _path: layoutPath,
                _done: function (data) {
                    document.documentElement.innerHTML = data;
                    document.getElementById(containerId).innerHTML = containerContent;
                    if (callback)
                        callback();
                },
                _error: function (request, textStatus, error) {
                    err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                }
            });
        };
        
        X.Modal = (function () {
            var element = null,
                _modalDelay = 5,
                _clickOut = null,
                _divNone = document.createElement("DIV").config({ Sdisplay: "none" }),
                _divBackdrop = document.createElement("DIV").addClass("modal-backdrop fade in"),
                _configConfig = function (_modalConfigAx, att, value) {
                    if (_modalConfigAx[att] === undefined) return { className: value }
                    if (_modalConfigAx[att] === false) return {};
                    
                    _modalConfigAx[att].className = (_modalConfigAx[att].className) ?
                        value + " " + _modalConfigAx[att].className : value;
                    return _modalConfigAx[att];
                },
                _clickOutsideModal = function (e) {
                    if (e.target.hasClass("modal fade in")) {
                        e.target.Toggle(false);
                        if (_clickOut) _clickOut();
                    }
                },
                closeModal = function() {
                    element.Toggle(false);
                },
                Toggle = function (content, toggleConfig) {
                    if(content === undefined) content = !this.IsShown;
                    this.IsShown = !!content;
                    if (!document.body.hasClass("modal-open")) { //if para verificar data-toggle
                        toggleConfig = toggleConfig || {};
                        X.Show(this[(content ? "add" : "remove") + "Class"]("in"), content, toggleConfig._delay || _modalDelay);
                        if (toggleConfig._clickOut !== false) {
                            if (content) _clickOut = toggleConfig._clickOut;
                            document.body[(content ? "add" : "remove") + "EventListener"]('click', _clickOutsideModal);
                        }
                        document.body[(content ? "append" : "remove") + "Child"](_divBackdrop);
                    } else document.body.removeClass("modal-open");
                    if (!content && this.onHideModal) this.onHideModal();
                };
                
            var createModal = function (id, modalConfig) {              
                modalConfig = modalConfig || {};
    
                modalConfig._XBtn = modalConfig._XBtn === undefined ? "x" : modalConfig._XBtn;
                modalConfig._XBtn = modalConfig._XBtn === false ? _divNone :
                    document.createElement('BUTTON').config({
                        className: "close", Fclick: closeModal, "Adata-dismiss": "modal", innerHTML: modalConfig._XBtn
                    });
    
                modalConfig._head = modalConfig._head || _divNone;
                modalConfig._body = modalConfig._body || _divNone;
    
                modalConfig._foot = modalConfig._foot === undefined ?
                    document.createElement('BUTTON').config({
                        className: "btn btn-default", Fclick: closeModal, "Adata-dismiss": "modal", innerHTML: "Fechar"
                    }) : modalConfig._foot || _divNone;
    
                element = document.body
                    .appendChild(document.createElement('DIV').config({ id: id, className: "modal fade" })
                        .append(document.createElement('DIV').config(_configConfig(modalConfig, "_configDialog", "modal-dialog"))
                            .append(document.createElement('DIV').config(_configConfig(modalConfig, "_configContent", "modal-content"))
                                .append(document.createElement('DIV').config(_configConfig(modalConfig, "_configHead", "modal-header"))
                                    .append(modalConfig._XBtn)
                                    .append(document.createElement('H4').config(_configConfig(modalConfig, "_configTitle", "modal-title")))
                                    .append(modalConfig._head))
                                .append(document.createElement('DIV').config(_configConfig(modalConfig, "_configBody", "modal-body"))
                                    .append(modalConfig._body))
                                .append(document.createElement('DIV').config(_configConfig(modalConfig, "_configFoot", "modal-footer"))
                                    .append(modalConfig._foot)
                                )
                            )
                        )
                    );
                    
                element.config({ Toggle, IsShown: false, ModalConfiguration: modalConfig });
                
                return element;
            };          
            return createModal;
        })();
        
        X.Modal.Alert = (function() {
            var _alertModal = null,
                _alertName = "alertXModal";
            
            return function (text) {
                if (_alertModal !== null)
                    _alertModal.getElementsByTagName("label")[0].innerHTML = text;
                else
                    _alertModal = X.Modal(_alertName, {
                        _configContent: { style: { width: "50%", margin: "0px auto 0px auto" } },
                        _configHead: { style: { border: "none" } },
                        _configFoot: { style: { border: "none", marginTop: "0px" } },
                        _body: document.createElement("LABEL").config({ innerHTML: text }),
                        _foot: document.createElement('BUTTON').config({
                            Fclick: () => _alertModal.Toggle(false),
                            innerHTML: "OK", className: "btn btn-default"
                        })
                    });
            
                _alertModal.Toggle(true);
                return _alertModal;
            };
        })();
        
        X.Modal.Confirm = (function() {
            var _confirmModal = null,
                _confirmName = "confirmXModal",
                _okClick = null, 
                _cancelClick = null;
            
            return function (text, func, footConfig) {
                footConfig = footConfig || {};
                if (_confirmModal !== null) {
                    _confirmModal.getElementsByTagName("button")[0].removeEventListener("click", _okClick);
                    _confirmModal.getElementsByTagName("button")[1].removeEventListener("click", _cancelClick);
                } else
                    _confirmModal = X.Modal(_confirmName, {
                        _XBtn: false,
                        _configHead: { Sdisplay: "none" },
                        _body: document.createElement("LABEL"),
                        _foot: document.createElement('DIV')
                        .append(document.createElement('BUTTON').config(footConfig._okButton || {
                            innerHTML: "OK", className: "btn btn-default"
                        }))
                        .append(document.createElement('BUTTON').config(footConfig._cancelButton || {
                            innerHTML: "Cancela", className: "btn btn-default"
                        }))
                    });
    
                _confirmModal.getElementsByTagName("LABEL")[0].innerHTML = text;
                _okClick = function () { 
                    _confirmModal.Toggle(false); 
                    func(true); 
                };
                _confirmModal.getElementsByTagName("button")[0].addEventListener("click", _okClick);
                _cancelClick = function () { 
                    _confirmModal.Toggle(false); 
                    func(false); 
                };
                _confirmModal.getElementsByTagName("button")[1].addEventListener("click", _cancelClick);
    
                _confirmModal.Toggle(true, { _clickOut: false });
                return _confirmModal;
            };                
        })();
        
        X.Modal.Prompt = (function() {
            var _promptModal = null,
                _promptName = "promptXModal",
                _promptFunc = null;
                
            return function (text, func) {
                if (_promptModal !== null)
                    _promptModal.getElementsByTagName("button")[0].removeEventListener("click", _promptFunc);
                else
                    _promptModal = X.Modal(_promptName, {
                        _foot: false, _XBtn: false, _head: false,
                        _configHead: { style: { display: "none" } },
                        _configBody: { style: { paddingTop: "none" } },
                        _body: document.createElement('DIV')
                        .append(document.createElement("LABEL")).append(document.createElement("BR"))
                        .append(document.createElement('DIV').config({ className: "input-group" })
                            .append(document.createElement("INPUT").config({ type: "text", className: "form-control", SmaxWidth: "none" }))
                            .append(document.createElement("SPAN").config({ className: "input-group-btn" })
                            .append(document.createElement("BUTTON").config({
                                className: "btn btn-defaul", type: "button", innerHTML: "OK", Sborder: "none"
                            }))
                            )),
                        _configFoot: { style: { display: "none" } }
                    });
    
                _promptModal.getElementsByTagName("label")[0].innerHTML = text;
                _promptModal.getElementsByTagName("input")[0].value = "";
                _promptFunc = function () {
                    _promptModal.Toggle(false);
                    func(_promptModal.getElementsByTagName("input")[0].value);
                };
                _promptModal.getElementsByTagName("button")[0].addEventListener("click", _promptFunc);
                _promptModal.Toggle(true, { _clickOut: false });
                return _promptModal;
            };              
        })();
            
        /*
        Construtor:
            titleConfig:
                element: (Objeto) Objeto com as configurações do Title:
                    _style: (Objeto) Objeto com as configurações de estilo do Title;
                    _delay: (Float) Tempo em milisegundos de fade-in do Title. Default: 20;
                    _name: (String) Nome do atributo e do id do Elemento do Title. Default: personalizeTitle;
        */
        X.Title = function (titleConfig) {
            var _titleName = "personalizeTitle",
                _titleEl = null,
                _titleDelay = 20,
                _titleStyle = {
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
                }, 
                getPlace = evt => _titleEl.config({
                    style: { left: (evt.pageX + 12) + "px", top: (evt.pageY + 20) + "px" }
                }),
                showTitle = function (text) {
                    X.Show(_titleEl, true, _titleDelay);
                    _titleEl.innerHTML = text;
                }, 
                hideTitle = function () {
                    X.Show(_titleEl, false);
                    _titleEl.innerHTML = "";
                }; 
                
            //Renderiza o Title.
            this.RenderTitle = function () {
                X.Show(_titleEl, false);
                X("[title]").forEach(function (el) {
                    el.setAttribute(_titleName, el.title);
                    el.removeAttribute("title");
                    el.onmouseover = function () { showTitle(el.getAttribute(_titleName)); };
                    el.onmouseout = function () { hideTitle(); };
                }); 
                
                document.getElementsByTagName("title").toArray().forEach(function (el) {
                    if (el.parentNode.tagName !== "HEAD") {
                        el.parentNode.setAttribute(_titleName, el.innerHTML);
                        el.remove();
                        el.parentNode.onmouseover = function () { showTitle(el.parentNode.getAttribute(_titleName)); };
                        el.parentNode.onmouseout = function () { hideTitle(); };
                    }
                });
            }
        
            titleConfig = titleConfig || {};
            if (titleConfig._style) 
                Object.keys(titleConfig._style).forEach(att => _titleStyle[att] = titleConfig._style[att]);
        
            _titleDelay = titleConfig._delay || _titleDelay;
            _titleName = titleConfig._name || _titleName;
            _titleEl = document.getElementById(_titleName) ||
                document.body.appendChild(document.createElement("DIV").config({
                    id: _titleName, style: _titleStyle
                }));
        
            document.onmousemove = getPlace;
            document.addEventListener(X.GetBrowser() !== "firefox" ? "mousewheel" : "DOMMouseScroll", getPlace, false);
            this.RenderTitle();
        };
            
        /*
        Construtor:
            element: (String OU HtmlElement) String com o id do Elemento OU o Elemento que irá mostrar o resultado,
                se não for enviado, apresentará o resultado via console.log;                
        */
        X.Derick = function(element){ 
            var start, end, diff, 
                msec, sec, min, hr,
                dateX, regxTime,
                chronoValue,
                intervCh = null, 
                intervCl = null,    
                Chrono = function(end) { 
                    end = end || new Date();
                    diff = new Date(end - start);
                    diff.setHours(end.getHours() - start.getHours());
                    SetTime(diff, true);
                },          
                SetTime = function(time, showMsec) {        
                    msec = time.getMilliseconds();
                    sec = time.getSeconds();
                    min = time.getMinutes();
                    hr = time.getHours();
                    if (hr < 0) hr = 24 + hr;
                    if (hr < 10) hr = "0" + hr;
                    if (min < 10) min = "0" + min;
                    if (sec < 10) sec = "0" + sec;
                    if (msec < 10) msec = "00" + msec;
                    else if (msec < 100) msec = "0" + msec;
                    SetChronoValue(`${hr}:${min}:${sec}${showMsec ? `:${msec}` : ""}`);
                },          
                StopCh = function() {
                    if(intervCh){
                        clearInterval(intervCh);
                        intervCh = null;
                    }
                },          
                StopCl = function() {
                    if(intervCl){
                        clearInterval(intervCl);
                        intervCl = null;
                    }
                },
                StopAll = function() {
                    StopCh();
                    StopCl();
                },
                SetChronoValue = function(value) {
                    chronoValue = value;
                    if(element)
                        element.innerHTML = chronoValue;
                    else {
                        console.log(chronoValue);
                    }
                };      
            element = typeof element === "string" ? document.getElementById(element) : element;
            
            this.Start = function() {
                StopCl();
                start = new Date();
                intervCh = setInterval(Chrono);
            };
            
            this.Continue = function() {
                StopCl();
                dateX = new Date();
                start = new Date(dateX - diff);
                start.setHours(dateX.getHours() - diff.getHours());
                intervCh = setInterval(Chrono); 
            };
            
            this.Reset = function() {
                StopAll();
                SetChronoValue("00:00:00:000");
                start = new Date();
            };
            
            //Mostra o tempo atual
            this.Clock = function() {
                StopAll();
                SetTime(new Date(), false);
                intervCl = setInterval(function(){SetTime(new Date(), false)}, 500);
            };
            
            /* Retorno: (Date) Tempo atual apresentado; */
            this.GetTime = function() {
                return diff;
            };
            
            /* Retorno: (String) Tempo atual apresentado; */
            this.GetValue = function() {
                return chronoValue;
            };
            
            /*
            Parametros: 
                deadline: (String OU Date) Data limite em String ou em Date;
                dayTime: (Boolean) Valor que define se a data limite passada será um horário do dia ou não;
            */
            this.Countdown = function(deadline, dayTime) {          
                switch(X.TypeOf(deadline)) {
                    case "date": dateX = deadline; break;
                    case "string":
                        dateX = new Date();
                        regxTime = deadline.match(/(\d+)(?::(\d\d))?(?::(\d\d))?(?::(\d+))?/);
                        dateX.setHours((dayTime ? 0 : (dateX.getHours())-1) + parseInt(regxTime[1]));
                        dateX.setMinutes((dayTime ? 0 : dateX.getMinutes()) + parseInt(regxTime[2]) || 0);
                        dateX.setSeconds((dayTime ? 0 : dateX.getSeconds()) + parseInt(regxTime[3]) || 0);
                        dateX.setMilliseconds((dayTime ? 0 : dateX.getMilliseconds()) + parseInt(regxTime[4]) || 0);
                        break;
                }
                StopAll();
                intervCh = setInterval(function() {
                    start = new Date(); 
                    return Chrono(dateX);
                });
            };
            
            this.Stop = StopCh;
        };
        
        X.Scraper = function(path, fun){
            var doc = document.implementation.createHTMLDocument("");
            
            X.Ajax({
                _path: path,
                _contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                _done: function(data, xhttp){
                    ((data.toLowerCase().indexOf('<!doctype') > -1) ? 
                        doc.documentElement : 
                        doc.body).innerHTML = data;                    
                    fun(doc, data);
                },
                _error: function(xhttp, status, responseText){
                    console.log(responseText);
                }
            });
        };
    }
    //////////////////////////////////////////////UTILS////////////////////////////////////////////////
    {
        /*
        Parametros:
            obAjax: (Objeto) Objeto com as configurações do ajax:
                _path: (String) URL do ajax
                        (pode estar pré-setado a váriavel window.rootUrl que diz aonde a aplicação se encontra);
                _type: (String) Tipo de requisição em caixa alta(POST, GET, PUT, DELETE);
                _dataType: (String OU Boolean) Tipo de data a ser enviado pelo ajax, 
                        se for false não irá adicionar Data-type no header do request,
                        se não for enviada o valor default é 'json';
                _contentType: (String OU Boolean) Tipo de conteudo a ser enviado pelo ajax, 
                        se for false não irá adicionar Content-type no header do request,
                        se não for enviada o valor default é 'application/x-www-form-urlencoded; charset=UTF-8';
                _arguments: (Objeto OU String) Paremetros para enviar no ajax;
                _done: (Function) função a ser executada após retorno e sucesso do ajax;
                        Paramentros:
                            value: O que retornou do ajax;
                            xhttp: (XMLHttpRequest) O objeto XMLHttpRequest do ajax;
                _error: (Function) função a ser executada se ocorrer algum erro durante o ajax;
                        Paramentros:
                            xhttp: (XMLHttpRequest) O objeto XMLHttpRequest do ajax;
                            status: (Int) O status do ajax;
                            responseText: (String) O que retornou do ajax;
        */
        X.Ajax = function (obAjax) {
            var path = (window.rootUrl || "") + obAjax._path,
                POST = obAjax._type === "POST",
                _arguments,
                obj = obAjax._arguments,            
                xhttp, resultValue, request,
                outputResult = function() {                 
                    if (obAjax._done != undefined) {
                        try {
                            resultValue = JSON.parse(xhttp.responseText);
                        } catch (e) {
                            resultValue = xhttp.responseText;
                        }
                        obAjax._done(resultValue, xhttp);
                    }
                };
            
            if (typeof XMLHttpRequest === "undefined") {                
                request = XDomainRequest || function () {
                    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
                    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
                    try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
                    throw "Esse browser não possui suporte para XMLHttpRequest.";
                };
            }       
            
            xhttp = new request();
            xhttp.withCredentials = true;
        
            if (obj) {
                switch (typeof obj) {
                    case 'object':
                        _arguments = Object.keys(obj).reduce((args, attr) => args +
                            (X.TypeOf(obj[attr]) === "array" ?
                                obj[attr].reduce((indices, el) => indices + attr + "=" + el + "&", "") :
                                attr + "=" + obj[attr] + "&"), POST ? "" : "?");
                        break;
                    case 'string': _arguments = (POST ? "" : "/") + obj; break;
                    default: _arguments = obj; break;
                }
        
                if (!POST) path += _arguments;
            }
            
            if(XDomainRequest)
                xhttp.onload = outputResult;
            else
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4) {
                        if (xhttp.status == 200) 
                            outputResult();
                        else
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
        X.TypeOf = (obj) => ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        
        /* Retorno: (String) O nome do browser atual em minúsuculo; */
        X.GetBrowser = function() {
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
        
        /*
        Parametros:
            obj: Objeto com as configurações do processamento:
                _percent: (String) Id da barra de progresso a ser atualizada durante o processamento;
                _array: (Array) Array a ser processado;
                _length: (Int) Tamanho do array enviado;
                _process: (Function) Função que na qual os elementos do array serão processados;
                _done: (Function) Função a ser executada após o término do processamento;
        */
        X.ProcessArray = function(obj) {
            setTimeout(function () {
                if (obj._percent)
                    X.PercentageRender(obj._percent, 100 - ((obj._array.length * 100) / obj._length));
                (obj._array.splice(0, Math.ceil(obj._length * 0.1))).forEach(x => obj._process(x));
                if (obj._array.length > 0)
                    setTimeout(X.ProcessArray(obj));
                else if (obj._done)
                    obj._done();
            });
        };
        
        /* Retorno: (String) Uma cor randomica em Hexadecimal; */
        X.RandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
        
        /*
        Parametros: 
            func: (Function) Função que irá ocorrer o teste de velocidade;
            params: (Array) Array com os parametros da função à ser testada;
        Retorno: (Float) O tempo em segundos de que demorou para executar 1000 interção da função enviada;
        */
        X.SpeedTest = function(func, params) {
            var start = performance.now() /*start timestamp*/, i;
            for (i = 0; i < 1000; i++)
                params ? func(...params) : func();
            return performance.now() - start;//end timestamp
        };
            
        /*
        Parametros: 
            str: (String) String a ser permutada;
        Retorno: (Array[String]) Array de Strings com todas possíveis combinações de caracteres da String enviada;
        */
        X.Permutations = function(str) {
            var fn = function(start, active){
                if ( active.length === 1 )
                    return [ start + active ];
                else {
                    var returnResult = [], i, result;
                    for (i = 0; i < active.length; i++) {
                        result = fn(active[i], active.substr(0, i) + active.substr(i+1));
                        returnResult.push(...result.map(x => start + x));
                    }
                    return returnResult;
                }
            }
            return fn("",str);
        };
        
        /*
        Parametros: 
            n: (Int) Número a ser fatoriado;
        Retorno: (Int) Número fatorado;
        */
        X.Factorial = n => n ? n*X.Factorial(n-1) : 1;
    }
    
    return X;
})();
