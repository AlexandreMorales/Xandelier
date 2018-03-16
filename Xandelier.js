/*jshint esversion:6*/
/*jslint es6:true*/
/*jslint this:true*/
/*jslint bitwise:true*/
/*jslint browser:true*/
/*eslint-disable no-useless-escape*/
////////////////////////////////////////////PROTOTYPES//////////////////////////////////////////////
(function () {
    "use strict";
    /*
    Parametros:
        className: (String) Classe a ser verificada;
    Retorno: (Boolean) Se o próprio elemento possui classe enviada;
    */
    Element.prototype.containsClass = function (className) {
        return this.classList.contains(...className.split(" "));
    };

    /*
    Parametros:
        className: (String) Classe a ser adicionada;
    Retorno: (Element) Elemento;
    */
    Element.prototype.addClass = function (className) {
        this.classList.add(...className.split(" "));
        return this;
    };

    /*
    Parametros:
        className: (String) Classe a ser removida;
    Retorno: (Element) Elemento;
    */
    Element.prototype.removeClass = function (className) {
        this.classList.remove(...className.split(" "));
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
        content: (Objeto OU Função) Objeto ou uma Função com as configurações do Elemento:
            Se for uma função o parâmetro mandado será o próprio elemento e essa função podera retornar um objeto com as configurações do Elemento;
            Para adicionar um evento o nome do atributo deve ser "F" + nome_do_evento e o conteúdo deve ser a função do evento;
            Para adicionar um estilo o nome do atributo deve ser "S" + nome_do_estilo e o conteúdo deve ser o valor do estilo;
            Para adicionar um atributo do DOM o nome do atributo deve ser "A" + nome_do_atributo e o conteúdo deve ser o valor do atributo;
            Para adicionar multiplos itens o nome do atributo deve ser o nome da função\atributo que adiciona eles (como "addEventListener", "style" e "setAttribute")
                e o conteúdo deve ser um objeto onde o atributo deve ser o nome do item a ser adicionado e o conteúdo deve ser o conteúdo desse item;
            Para adicionar um atributo apenas envie o seu próprio nome e conteúdo;
    Retorno: (Element) Elemento;
    */
    Element.prototype.config = function (content) {
        if (typeof content === "function")
            content = content(this);
        if (!content)
            return this;
        Object.entries(content).forEach(([key, value]) => {
            if (typeof value === "object") {
                if (!this[key])
                    this[key] = value;
                else if (typeof this[key] === "function")
                    Object.entries(value).forEach(this[key]);
                else
                    Object.assign(this[key], value);
            } else
                switch (key[0]) {
                    case "F":
                        this.addEventListener(key.substr(1), value);
                        break;
                    case "S":
                        this.style[key.substr(1)] = value;
                        break;
                    case "A":
                        this.setAttribute(key.substr(1), value);
                        break;
                    default:
                        this[key] = value;
                        break;
                }
        });
        return this;
    };

    /*
    Parametros:
        element: (String OU HtmlElement) String com o tagName do novo Elemento OU o Elemento a que será inserido;
        config:  (Objeto) Objeto com as configurações do Elemento (ver config);
    Retorno: (Element) Elemento pai;
    */
    Element.prototype.append = function (element, config) {
        if (element !== false) {
            element = typeof element === "string" ? X.createElement(element, config) : element;
            if (Array.isArray(element))
                element.forEach(el => this.appendChild(el));
            else
                this.appendChild(element);
        }
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

    /* Retorno: (Element) O Elemento enviado vazio; */
    Element.prototype.empty = function () {
        while (this.firstChild)
            this.removeChild(this.firstChild);
        return this;
    };

    /* Retorno: (Element) O Elemento posterior; */
    Element.prototype.getNextElement = function () {
        let el = this;
        while (el.nextSibling && !el.nextSibling.tagName)
            el = el.nextSibling;
        return el.nextSibling;
    };

    /* Retorno: (Element) O Elemento anterior; */
    Element.prototype.getPreviousElement = function () {
        let el = this;
        while (el.previousSibling && !el.previousSibling.tagName)
            el = el.previousSibling;
        return el.previousSibling;
    };

    /* Retorno: (Element) O primeiro Elemento filho; */
    Element.prototype.firstElement = function () {
        return this.children[0];
    };

    /* Retorno: (Element) O último Elemento filho; */
    Element.prototype.lastElement = function () {
        return this.children[this.children.length - 1];
    };

    //Pega os elementos de dentro do Elemento de acordo com o seletor enviado
    Element.prototype.getElements = function (selector) {
        return X(selector, this);
    };

    Element.prototype.getAllParents = function () {
        const parents = [];
        let elParentElement = this.parentElement;
        while (elParentElement) {
            parents.unshift(elParentElement);
            elParentElement = elParentElement.parentElement;
        }
        return parents;
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
        const arrayUnique = [this[0]],
            arrayUniqueAtt = [fun(this[0])];
        let value = null;
        this.forEach((el) => {
            value = fun(el);
            if (!arrayUniqueAtt.includes(value)) {
                arrayUniqueAtt.push(value);
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
    Array.prototype.contains = function (value) {
        if (Array.isArray(value)) return !value.find(el => !this.includes(el));
        if (X.typeOf(value) === "object") return !Object.values(value).find(val => !this.includes(val));
        return this.includes(value);
    };

    /*
    Parametros:
        el: (String OU Float) Elemento a ser buscado;
        objSearch: (Objeto) Objeto com as configurações da busca:
            _att: (String) Atributo de comparação entre os elementos do array,
                    se não for enviada então a regra será comparar elemento por elemento;
            _diacriticsSensitive: (Boolean) Valor que indica se na comparação de strings não irá desconsiderar os acentos;
            _caseSensitive: (Boolean) Valor que indica se na comparação de strings não será Case Sensitive;
    Retorno: (Array) Array com os elementos filtrados pela busca;
    */
    Array.prototype.search = function (el, objSearch) {
        const { _att, _diacriticsSensitive, _caseSensitive } = objSearch,
            normalizeString = (str) => {
                if (!_diacriticsSensitive) str = str.removeDiacritics();
                if (!_caseSensitive) str = str.toUpperCase();
                return str;
            };

        return this.filter(d => {
            d = (_att ? d[_att] : d);
            switch (typeof el) {
                case "number": return d === el;
                case "string": return normalizeString(d).includes(normalizeString(el));
            }
            return false;
        });
    };

    /* Retorno: (Array) Array contendo a diferença entre os dois arrays enviados; */
    Array.prototype.difference = function (array) {
        let smaller = null;
        const larger = this.length > array.length ?
            (smaller = array, this) :
            (smaller = this, array);
        return larger.filter(key => !smaller.includes(key));
    };

    /* Retorno: (Array) Array embaralhado; */
    Array.prototype.shuffle = function () {
        let currentIndex = this.length,
            randomIndex = 0;

        //Enquanto ainda estiver elementos para ordenar
        while (0 !== currentIndex) {
            //Pegue um elemento faltando
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            //Troca pelo elemento atual
            [this[randomIndex], this[currentIndex]] = [this[currentIndex], this[randomIndex]];
        }

        return this;
    };

    /*
    Parametros:
        includers: (Array OU Objeto) Array ou Objeto com os valores à serem substituidos na string,
                se for enviado um Array, irá substituir por index,
                se for enviado um Objeto, irá substituir por atributo;
    Retorno: (String) String formatada; */
    String.prototype.format = function (includers) {
        const isObj = !Array.isArray(includers),
            array = isObj ? Object.keys(includers) : includers,
            length = array.length;

        let originalSt = this,
            i = 0;

        for (; i < length; i++) {
            const index = isObj ? array[i] : i;
            originalSt = originalSt.replace(`{${index}}`, includers[index]);
        }
        return originalSt;
    };

    /* Retorno: (String) String sem acentos; */
    String.prototype.removeDiacritics = (function () {
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
        const diacriticsMap = [
            { base: "A", letters: "\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F" },
            { base: "AA", letters: "\uA732" },
            { base: "AE", letters: "\u00C6\u01FC\u01E2" },
            { base: "AO", letters: "\uA734" },
            { base: "AU", letters: "\uA736" },
            { base: "AV", letters: "\uA738\uA73A" },
            { base: "AY", letters: "\uA73C" },
            { base: "B", letters: "\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181" },
            { base: "C", letters: "\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E" },
            { base: "D", letters: "\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779" },
            { base: "DZ", letters: "\u01F1\u01C4" },
            { base: "Dz", letters: "\u01F2\u01C5" },
            { base: "E", letters: "\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E" },
            { base: "F", letters: "\u0046\u24BB\uFF26\u1E1E\u0191\uA77B" },
            { base: "G", letters: "\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E" },
            { base: "H", letters: "\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D" },
            { base: "I", letters: "\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197" },
            { base: "J", letters: "\u004A\u24BF\uFF2A\u0134\u0248" },
            { base: "K", letters: "\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2" },
            { base: "L", letters: "\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780" },
            { base: "LJ", letters: "\u01C7" },
            { base: "Lj", letters: "\u01C8" },
            { base: "M", letters: "\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C" },
            { base: "N", letters: "\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4" },
            { base: "NJ", letters: "\u01CA" },
            { base: "Nj", letters: "\u01CB" },
            { base: "O", letters: "\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C" },
            { base: "OI", letters: "\u01A2" },
            { base: "OO", letters: "\uA74E" },
            { base: "OU", letters: "\u0222" },
            { base: "OE", letters: "\u008C\u0152" },
            { base: "oe", letters: "\u009C\u0153" },
            { base: "P", letters: "\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754" },
            { base: "Q", letters: "\u0051\u24C6\uFF31\uA756\uA758\u024A" },
            { base: "R", letters: "\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782" },
            { base: "S", letters: "\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784" },
            { base: "T", letters: "\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786" },
            { base: "TZ", letters: "\uA728" },
            { base: "U", letters: "\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244" },
            { base: "V", letters: "\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245" },
            { base: "VY", letters: "\uA760" },
            { base: "W", letters: "\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72" },
            { base: "X", letters: "\u0058\u24CD\uFF38\u1E8A\u1E8C" },
            { base: "Y", letters: "\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE" },
            { base: "Z", letters: "\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762" },
            { base: "a", letters: "\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250" },
            { base: "aa", letters: "\uA733" },
            { base: "ae", letters: "\u00E6\u01FD\u01E3" },
            { base: "ao", letters: "\uA735" },
            { base: "au", letters: "\uA737" },
            { base: "av", letters: "\uA739\uA73B" },
            { base: "ay", letters: "\uA73D" },
            { base: "b", letters: "\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253" },
            { base: "c", letters: "\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184" },
            { base: "d", letters: "\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A" },
            { base: "dz", letters: "\u01F3\u01C6" },
            { base: "e", letters: "\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD" },
            { base: "f", letters: "\u0066\u24D5\uFF46\u1E1F\u0192\uA77C" },
            { base: "g", letters: "\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F" },
            { base: "h", letters: "\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265" },
            { base: "hv", letters: "\u0195" },
            { base: "i", letters: "\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131" },
            { base: "j", letters: "\u006A\u24D9\uFF4A\u0135\u01F0\u0249" },
            { base: "k", letters: "\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3" },
            { base: "l", letters: "\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747" },
            { base: "lj", letters: "\u01C9" },
            { base: "m", letters: "\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F" },
            { base: "n", letters: "\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5" },
            { base: "nj", letters: "\u01CC" },
            { base: "o", letters: "\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275" },
            { base: "oi", letters: "\u01A3" },
            { base: "ou", letters: "\u0223" },
            { base: "oo", letters: "\uA74F" },
            { base: "p", letters: "\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755" },
            { base: "q", letters: "\u0071\u24E0\uFF51\u024B\uA757\uA759" },
            { base: "r", letters: "\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783" },
            { base: "s", letters: "\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B" },
            { base: "t", letters: "\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787" },
            { base: "tz", letters: "\uA729" },
            { base: "u", letters: "\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289" },
            { base: "v", letters: "\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C" },
            { base: "vy", letters: "\uA761" },
            { base: "w", letters: "\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73" },
            { base: "x", letters: "\u0078\u24E7\uFF58\u1E8B\u1E8D" },
            { base: "y", letters: "\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF" },
            { base: "z", letters: "\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763" }
        ].reduce((obj, item) => {
            [...item.letters].forEach(l => obj[l] = item.base);
            return obj;
        }, {});
        // "what?" version... http://jsperf.com/diacritics/12
        return function () {
            return this.replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a);
        };
    })();
})();

let X, Xand, Xandelier;
X = Xand = Xandelier = (function () {
    "use strict";
    const X = (function () {

        class FilterObj {
            constructor(funcFilter, funcExec) {
                this.funcFilter = funcFilter;
                this.funcExec = funcExec || funcExecWithFilter(funcFilter);
            }
        }

        let initialElement = null,
            funcGetAtt = null,
            item = null,
            configNot = false;

        const funcExecWithFilter = (fnFilter) => (el) => Array.from(el.getElementsByTagName("*")).filter(fnFilter),
            inputsTagNames = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"],
            selectorMapper = {
                ID: "#", CHILDREN: ">", PRECEDED: "~", OR: "|", ALLCHILDREN: " ", VDOM: "§", ALL: "*",
                CLASS: ".", PARENT: "<", SUCEDED: "+", AND: ",", NOT: "!", NAME: "$", TYPE: ":"
            },
            regexQuery = new RegExp("[\\w\\-]+(\\([\\w\\-]+\\))?|\\{ID}|\\{CLASS}|\\[\\{VDOM}?[\\w\\s\\-\\<\\>\\~\\!\\|\\^\\$\\*\\=]+|\\]|\\{ALL}|\\{NAME}|\\{ALLCHILDREN}|\\{OR}|\\{NOT}|\\{AND}|\\{CHILDREN}|\\{PARENT}|\\{SUCEDED}|\\{PRECEDED}|\\{TYPE}".format(selectorMapper), "g"),
            /* /[\w\-]+(\([\w\-]+\))?|\#|\.|\[\§?[\w\s\-\<\>\~\!\|\^\$\*\=]+|\]|\*|\$|\ |\||\!|\,|\>|\<|\+|\~|\:/g */
            regexAttOp = new RegExp("\\{VDOM}|[\\w\\s\\-]+|[\\<\\>\\~\\!\\|\\^\\$\\*\\=]+".format(selectorMapper), "g"),
            /* /\§|[\w\s\-]+|[\<\>\~\!\|\^\$\*\=]+/g */
            regexType = /[\w\-]+|\(|[\w\-]+|\)/g,
            mapFunc = {
                "=": new FilterObj(el => (funcGetAtt(el) == item) ^ configNot),
                "<": new FilterObj(el => (parseFloat(funcGetAtt(el)) < parseFloat(item)) ^ configNot),
                ">": new FilterObj(el => (parseFloat(funcGetAtt(el)) > parseFloat(item)) ^ configNot),
                "<=": new FilterObj(el => (parseFloat(funcGetAtt(el)) <= parseFloat(item)) ^ configNot),
                ">=": new FilterObj(el => (parseFloat(funcGetAtt(el)) >= parseFloat(item)) ^ configNot),
                "!=": new FilterObj(el => (funcGetAtt(el) != item) ^ configNot),
                "~=": new FilterObj(el => (funcGetAtt(el) || "").split(" ").contains(item) ^ configNot),
                "^=": new FilterObj(el => (funcGetAtt(el) || "").startsWith(item) ^ configNot),
                "$=": new FilterObj(el => (funcGetAtt(el) || "").endsWith(item) ^ configNot),
                "|=": new FilterObj(el => (funcGetAtt(el) || "").startsWith(`${item}-`) ^ configNot),
                "*=": new FilterObj(el => ((funcGetAtt(el) || "").includes(item)) ^ configNot),
                "hasAtt": new FilterObj(el => (!!funcGetAtt(el) ^ configNot)),
                "tagName": new FilterObj(
                    el => ((el.tagName.toLowerCase() === item) ^ configNot),
                    el => Array.from(el.getElementsByTagName(item))),
                "funcAtt": new FilterObj(
                    el => el.getAttribute(funcGetAtt) == item || el.getAllParents().find(e => e.getAttribute(funcGetAtt) === item),
                    el => Array.from(el.getElementsByTagName("*")).filter(e => !e.getAttribute(funcGetAtt) || e.getAttribute(funcGetAtt) === item)),
                [selectorMapper.ID]: new FilterObj(
                    el => (el.id === item) ^ configNot,
                    el => (el.getElementById) ? [el.getElementById(item)] : funcExecWithFilter(e => (e.id === item) ^ configNot)(el)),
                [selectorMapper.CLASS]: new FilterObj(
                    el => el.containsClass(item) ^ configNot,
                    el => Array.from(el.getElementsByClassName(item))),
                [selectorMapper.NAME]: new FilterObj(
                    el => (el.name === item) ^ configNot,
                    el => (el.getElementsByName) ? Array.from(el.getElementsByName(item)) : funcExecWithFilter(e => (e.name === item) ^ configNot)(el)),
                [selectorMapper.TYPE]: new FilterObj(el => ((el.type === item) ^ configNot))
            },
            mapType = {
                "even": new FilterObj(el => el.tagName === "TR" && ((el.rowIndex % 2 === 1) ^ configNot)),
                "odd": new FilterObj(el => el.tagName === "TR" && ((el.rowIndex % 2 === 0) ^ configNot)),
                "first-child": new FilterObj(el => (el.parentNode.firstElement() === el) ^ configNot),
                "first-of-type": new FilterObj(el => (el.parentNode.getElements(`>${el.tagName}`)[0] === el) ^ configNot),
                "last-child": new FilterObj(el => (el.parentNode.lastElement() === el) ^ configNot),
                "last-of-type": new FilterObj(el => (el.parentNode.getElements(`>${el.tagName}`).pop() === el) ^ configNot),
                "only-child": new FilterObj(el => (el.parentNode.firstElement() === el && el.parentNode.children.length === 1) ^ configNot),
                "only-of-type": new FilterObj(
                    function (el) {
                        let elTypes = el.parentNode.getElements(`>${el.tagName}`);
                        return (elTypes[0] === el && elTypes.length === 1) ^ configNot;
                    }),
                "header": new FilterObj(el => !!el.tagName.match(/H\d/g) ^ configNot),
                "empty": new FilterObj(el => (el.innerHTML === "") ^ configNot),
                "parent": new FilterObj(el => (el.innerHTML !== "") ^ configNot),
                "input": new FilterObj(el => inputsTagNames.includes(el.tagName) ^ configNot),
                "hidden": new FilterObj(el => el.hidden ^ configNot),
                "visible": new FilterObj(el => !el.hidden ^ configNot),
                "enabled": new FilterObj(el => !el.disabled ^ configNot),
                "disabled": new FilterObj(el => el.disabled ^ configNot),
                "selected": new FilterObj(el => el.tagName === "OPTION" && (el.selected ^ configNot)),
                "checked": new FilterObj(el => el.tagName === "INPUT" && (el.checked ^ configNot))
                //"animated":   new FilterObj(el => ((funcGetAtt(el) == item) ^ configNot))
            },
            mapFuncType = {
                // "nth-child":         new FilterObj(el => true),
                // "nth-last-child":    new FilterObj(el => true),
                // "nth-of-type":       new FilterObj(el => true),
                // "nth-last-of-type":  new FilterObj(el => true),
                // "eq":                new FilterObj(el => true),
                // "gt":                new FilterObj(el => true),
                // "lt":                new FilterObj(el => true),
                // "contains":          new FilterObj(el => true),
                // "has":               new FilterObj(el => true),
                // "lang":              new FilterObj(el => true)
            },
            mapMap = {
                parent: el => el.parentElement,
                suceded: el => el.getNextElement(),
                preceded: el => el.getPreviousElement()
            };

        function getElement(selectors, elements, config = {}) {
            try {
                let funcExecFilter = null,
                    selector = "",
                    resultElements = null;

                initialElement = initialElement || (elements = elements || document);
                if (!elements) return elements;
                if (!Array.isArray(elements)) elements = [elements];
                if (!selectors.length)
                    return (config.action === "children") ?
                        elements.reduce((array, el) => [...array, ...el.children], []) :
                        mapMap.hasOwnProperty(config.action) ?
                            elements.reduce((array, el) => {
                                let value = mapMap[config.action](el);
                                if (value) array.push(value);
                                return array;
                            }, []) :
                            elements;

                selectors = (typeof selectors === "string") ? selectors.match(regexQuery) : selectors;
                selector = selectors.shift();

                switch (selector) {
                    case selectorMapper.ALL: return getElement(selectors, elements.reduce((array, el) => [...array, ...el.getElementsByTagName("*")], []));
                    case selectorMapper.ALLCHILDREN:
                        config.include = false;
                        return getElement(selectors, elements, config);
                    case selectorMapper.NOT:
                        if (elements[0].getElementById)
                            elements = Array.from(elements[0].getElementsByTagName("*"));
                        configNot = true;
                        return getElement(selectors, elements, config);
                    case selectorMapper.ID:
                        item = selectors.shift();
                        if (elements[0].getElementById)
                            return getElement(selectors, elements[0].getElementById(item));
                        break;
                    case selectorMapper.CHILDREN: return getElement(selectors, elements, { action: "children" });
                    case selectorMapper.PARENT: return getElement(selectors, elements, { action: "parent" });
                    case selectorMapper.SUCEDED: return getElement(selectors, elements, { action: "suceded" });
                    case selectorMapper.PRECEDED: return getElement(selectors, elements, { action: "preceded" });
                    case selectorMapper.AND: return [...elements, ...getElement(selectors, initialElement)];
                    case selectorMapper.OR: return (elements.length ? elements : false) || getElement(selectors, initialElement);
                    case selectorMapper.TYPE:
                        item = selectors.shift();
                        switch (item) {
                            case "first": return elements[0];
                            case "last": return elements[elements.length - 1];
                            case "focus": return initialElement.activeElement;
                            case "root": return initialElement.documentElement;
                        }
                        funcExecFilter = mapType[item];
                        if (!funcExecFilter) {
                            const arrayRegexType = item.match(regexType);
                            funcGetAtt = arrayRegexType[0];
                            funcExecFilter = mapFuncType[funcGetAtt];
                            if (funcExecFilter || funcGetAtt) {
                                if (arrayRegexType.pop() !== ")")
                                    throw "Os parentêses não foram fechados. Ex.: :funcao(valor)";
                                item = arrayRegexType[2];
                                if (!funcExecFilter) {
                                    funcExecFilter = mapFunc.funcAtt;
                                    //selectors.unshift("*");
                                }
                            } else
                                funcExecFilter = mapFunc[selectorMapper.TYPE];
                        }
                        break;
                    case selectorMapper.CLASS:
                    case selectorMapper.NAME:
                        item = selectors.shift();
                        break;
                    default:
                        if (selector[0] === "[") {
                            if (selectors.shift() !== "]") throw "Os conchetes não foram fechados. Ex.: [atributo=valor]";
                            const arrayRegexAtt = selector.match(regexAttOp);
                            funcGetAtt = (arrayRegexAtt[0] === selectorMapper.VDOM) ?
                                (arrayRegexAtt.shift(), el => el.getVDOMAttribute(arrayRegexAtt[0])) :
                                el => el.getAttribute(arrayRegexAtt[0]);
                            selector = arrayRegexAtt[1] || "hasAtt";
                            item = arrayRegexAtt[2];
                        } else
                            item = selector.toLowerCase();
                        break;
                }

                funcExecFilter = funcExecFilter || mapFunc[selector] || mapFunc.tagName;

                if (config.include)
                    resultElements = elements.filter(funcExecFilter.funcFilter);
                else if (config.action === "children")
                    resultElements = elements.reduce((array, el) =>
                        [...array, ...Array.from(el.children).filter(funcExecFilter.funcFilter)], []);
                else if (mapMap.hasOwnProperty(config.action))
                    resultElements = elements.reduce((array, el) => {
                        el = mapMap[config.action](el);
                        if (el && funcExecFilter.funcFilter(el))
                            array.push(el);
                        return array;
                    }, []);
                else {
                    const alreadyPassedParents = [];
                    resultElements = elements.reduce((array, el) => {
                        let elParentElement = el.parentElement;
                        while (elParentElement) {
                            if (alreadyPassedParents.contains(elParentElement)) return array;
                            elParentElement = elParentElement.parentElement;
                        }
                        alreadyPassedParents.push(el);
                        return [...array, ...funcExecFilter.funcExec(el)];
                    }, []);
                }

                configNot = false;

                return getElement(selectors, resultElements, { include: true });
            } finally {
                initialElement = null;
            }
        }

        return getElement;
    })();

    //////////////////////////////////////////////UTILS////////////////////////////////////////////////
    (function () {
        /*
        Parametros:
            obAjax: (Objeto) Objeto com as configurações do ajax:
                _path: (String) URL do ajax
                        (o início da url pode estar pré-setado na váriavel X.ajax.url);
                _type: (String) Tipo de requisição em caixa alta(POST, GET, PUT, DELETE);
                _headers: (Objeto) Objeto com os headers da requisição, com algumas propriedades padrões:
                    "Data-Type": (String OU Boolean) Tipo de data a ser enviado pelo ajax,
                            se for false não irá adicionar Data-type no header do request,
                            se não for enviada o valor default é "json";
                    "Content-Type": (String OU Boolean) Tipo de conteudo a ser enviado pelo ajax,
                            se for false não irá adicionar Content-type no header do request,
                            se não for enviada o valor default é "application/x-www-form-urlencoded; charset=UTF-8";
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
        X.ajax = function (obAjax) {
            const { _path, _type = "GET", _headers = {}, _arguments, _done, _error } = obAjax,
                hasBodyMessage = _type === "POST" || _type === "PUT",
                xhttp = new XMLHttpRequest();

            let finalArguments,
                path = (X.ajax.url || "") + _path;

            if (_arguments) {
                switch (typeof _arguments) {
                    case "object":
                        finalArguments = Object.entries(_arguments).reduce((args, [key, value]) => {
                            return args + (Array.isArray(value) ?
                                value.reduce((indexes, el) => `${indexes}${key}=${el}&`, "") :
                                `${key}=${value}&`), hasBodyMessage ? "" : "?";
                        });
                        break;
                    case "string": finalArguments = (hasBodyMessage ? "" : "/") + _arguments; break;
                    default: finalArguments = _arguments; break;
                }

                if (!hasBodyMessage) path += finalArguments;
            }

            xhttp.onreadystatechange = () => {
                let resultValue;
                if (xhttp.readyState === 4) {
                    if (xhttp.status === 200) {
                        if (_done !== undefined) {
                            try {
                                resultValue = JSON.parse(xhttp.responseText);
                            } catch (e) {
                                resultValue = xhttp.responseText;
                            }
                            _done(resultValue, xhttp);
                        }
                    }
                    else
                        xhttp.onerror();
                }
            };

            xhttp.onerror = () => {
                if (_error !== undefined) _error(xhttp, xhttp.status, xhttp.responseText);
            };

            xhttp.open(_type, path);

            if (hasBodyMessage) {
                const setDefaultValue = (key, defaultValue) => {
                    if (_headers.hasOwnProperty(key)) {
                        if (_headers[key] === false) 
                            delete _headers[key];
                    } else
                        _headers[key] = defaultValue;
                };

                setDefaultValue("Data-type", "json");
                setDefaultValue("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            }

            Object.entries(_headers).forEach(xhttp.setRequestHeader);

            if (hasBodyMessage)
                xhttp.send(finalArguments);
            else
                xhttp.send();
        };

        X.ajax.url = "";

        /*
        Parametros:
            obj: Objeto enviado;
        Retorno: (String) O tipo do objeto em minúsuculo;
        */
        X.typeOf = obj => ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

        /* Retorno: (String) O nome do browser atual em minúsuculo; */
        X.getBrowser = () => {
            if (window.opera || navigator.userAgent.includes(" OPR/"))
                // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
                return "opera";
            if (typeof InstallTrigger !== "undefined") // Firefox 1.0+
                return "firefox";
            if (Object.prototype.toString.call(window.HTMLElement).includes("Constructor"))
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
        X.processArray = obj => {
            setTimeout(() => {
                if (obj._percent)
                    X.percentageRender(obj._percent, 100 - ((obj._array.length * 100) / obj._length));
                obj._array.splice(0, Math.ceil(obj._length * 0.1)).forEach(x => obj._process(x));
                if (obj._array.length > 0)
                    setTimeout(X.processArray(obj));
                else if (obj._done)
                    obj._done();
            });
        };

        /* Retorno: (String) Uma cor randomica em Hexadecimal; */
        X.randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        /*
        Parametros:
            func: (Function) Função que irá ocorrer o teste de velocidade;
            params: (Array) Array com os parametros da função à ser testada;
        Retorno: (Float) O tempo em segundos de que demorou para executar 1000 interção da função enviada;
        */
        X.speedTest = (func, params) => {
            const start = performance.now(); // start timestamp
            let i = 0;
            for (; i < 1000; i++)
                if (params) func(...params); else func();
            return performance.now() - start; // end timestamp
        };

        /*
        Parametros:
            str: (String) String a ser permutada;
        Retorno: (Array[String]) Array de Strings com todas possíveis combinações de caracteres da String enviada;
        */
        X.permutations = str => {
            const fn = (start, active) => {
                const length = active.length;
                if (length === 1)
                    return [start + active];
                else {
                    const map = x => start + x;
                    let returnResult = [],
                        i = 0;

                    for (; i < length; i++) {
                        const result = fn(active[i], active.substr(0, i) + active.substr(i + 1));
                        returnResult = [...returnResult, ...result.map(map)];
                    }
                    return returnResult;
                }
            };
            return fn("", str);
        };

        /*
        Parametros:
            n: (Int) Número a ser fatoriado;
        Retorno: (Int) Número fatorado;
        */
        X.factorial = n => n ? n * X.factorial(n - 1) : 1;
    })();

    /////////////////////////////////////////////ELEMENTS//////////////////////////////////////////////
    (function () {
        /*
        Parametros:
            element: (String OU HtmlElement) String com o id do Elemento OU Elemento a ser mostrado ou escondido;
            show:   (Boolean) Valor para decidir se o Elemento irá ser mostrado ou escondido,
                        se não for informado então a função retorna o display do Elemento enviado;
            delay:   (Float) Tempo em ms para mostrar ou esconder o Elemento;
            callback:   (Function) Função que irá ser executada após o delay;
        Retorno: (String) Se não for informado o parametro show então o função retorna o display do Elemento enviado;
        */
        X.show = (element, show, delay, callback) => {
            element = typeof element === "string" ? document.getElementById(element) : element;
            if (show === undefined) return element.style.display;
            if (delay === undefined) element.style.display = show ? "block" : "none";
            else {
                let opacity = show ? 0.1 : 1; // opacidade inicial
                element.config({ style: { display: "block", opacity } });
                const timer = setInterval(() => {
                    if (opacity > 1 || opacity < 0.1) {
                        clearInterval(timer);
                        element.style.display = show ? "block" : "none";
                        if (callback) callback(element);
                    }
                    element.config({ style: { opacity, filter: `alpha(opacity=${opacity * 100})` } });
                    opacity = opacity + (opacity * 0.1) * (show ? 1 : -1);
                }, delay);
            }
        };

        /*
        Parametros:
            tagName: (String) Tag do novo elemento;
            config:  (Objeto) Objeto com as configurações do Elemento (ver config);
        Retorno: (Element) Elemento;
        */
        X.createElement = (tagName, config) => document.createElement(tagName).config(config);

        /*
        Parametros:
            idProcess: (String OU HtmlElement) String com o id do Progress Bar OU o Progress Bar;
            value: (Float) Porcentagem do Progress Bar;
        Retorno: (Element) Progress Bar;
        */
        X.percentageRender = (element, value) => {
            element = typeof element === "string" ? document.getElementById(element) : element;
            return element.config({
                Swidth: `${value}%`,
                innerHTML: `${Math.round(value)}%`,
                "Aaria-valuenow": value
            });
        };

        /*
        Parametros:
            layoutPath: (String) Caminho do layout original;
            containerId: (String) Id do container dentro do layout original que será renderizado conteúdo da página atual;
            callback: (Função) Função de callback após renderizar o layout;
        */
        X.setLayout = (layoutPath, containerId, callback) => {
            const containerContent = document.documentElement.innerHTML;
            X.ajax({
                _path: layoutPath,
                _done: (data) => {
                    document.documentElement.innerHTML = data;
                    document.getElementById(containerId).innerHTML = containerContent;
                    if (callback) callback();
                },
                _error: (request, textStatus, error) => {
                    X.modal.alert(`Request Failed: ${textStatus}, ${error}`);
                }
            });
        };

        X.modal = (function () {
            const modalDelay = 10,
                divBackdrop = X.createElement("DIV", { className: "modal-backdrop fade show" });

            let modalElement = null;

            function configConfig(modalConfig, att, value) {
                if (modalConfig[att]) {
                    let id = value.id;
                    if (modalConfig[att].className)
                        modalConfig[att].className = `${value.className} ${modalConfig[att].className}`;

                    Object.assign(value, modalConfig[att]);
                    value.id = id;
                }

                return value;
            }

            function clickOutsideModal(e) {
                if (e.target.containsClass("modal fade in"))
                    closeModal();
            }

            function closeModal() {
                modalElement.toggle(false);
            }

            return function (id, modalConfig = {}) {
                modalElement = typeof id === "string" ? document.getElementById(id) : id;
                if (!modalElement) {
                    if (!modalConfig.hasOwnProperty("_CloseBtnText")) modalConfig._CloseBtnText = "x";

                    if (!modalConfig.hasOwnProperty("_CloseBtn"))
                        modalConfig._CloseBtn = X.createElement("BUTTON", {
                            className: "close",
                            Fclick: closeModal,
                            "Adata-dismiss": "modal",
                            "Adata-label": "Close"
                        }).append("SPAN", {
                            "Aaria-hidden": "true",
                            innerHTML: modalConfig._CloseBtnText
                        });

                    if (!modalConfig.hasOwnProperty("_foot"))
                        modalConfig._foot = X.createElement("BUTTON", {
                            className: "btn btn-secondary",
                            Fclick: closeModal,
                            innerHTML: "Fechar"
                        });

                    modalElement = document.body
                        .appendChild(X.createElement("DIV", configConfig(modalConfig, "_configModal", { id, className: "modal fade", Atabindex: "-1", Arole: "dialog" }))
                            .append(X.createElement("DIV", configConfig(modalConfig, "_configDialog", { className: "modal-dialog", Arole: "document" }))
                                .append(X.createElement("DIV", configConfig(modalConfig, "_configContent", { className: "modal-content" }))
                                    .append(X.createElement("DIV", configConfig(modalConfig, "_configHead", { className: "modal-header" }))
                                        .append("H5", configConfig(modalConfig, "_configTitle", { innerHTML: modalConfig._titleText || "", className: "modal-title" }))
                                        .append(modalConfig._CloseBtn))
                                    .append(X.createElement("DIV", configConfig(modalConfig, "_configBody", { className: "modal-body" }))
                                        .append(modalConfig._body))
                                    .append(X.createElement("DIV", configConfig(modalConfig, "_configFoot", { className: "modal-footer" }))
                                        .append(modalConfig._foot)
                                    )
                                )
                            )
                        );

                    modalElement.toggle = (content, toggleConfig = {}) => {
                        if (content === undefined) content = !modalElement.isShown;
                        else modalElement.isShown = !!content;
                        if (!document.body.classList.contains("modal-open")) { //if para verificar data-toggle
                            if (content) {
                                document.body.appendChild(divBackdrop);
                                modalElement.classList.add("in");
                                X.show(modalElement, true, toggleConfig._delay || modalDelay);
                                if (toggleConfig._clickOut === true)
                                    document.body.addEventListener("click", clickOutsideModal);
                            } else {
                                X.show(modalElement, false, toggleConfig._delay || modalDelay, () => {
                                    document.body.removeChild(divBackdrop);
                                    modalElement.classList.remove("in");
                                    document.body.removeEventListener("click", clickOutsideModal);
                                });
                            }
                        } else
                            document.body.classList.remove("modal-open");
                        if (!content && modalElement.onHideModal) modalElement.onHideModal();
                    };

                    modalConfig.isShown = false;
                }
                return modalElement.config(modalConfig);
            };
        })();

        X.modal.alert = function (text, title) {
            const alertModal = X.modal("x-modal-alert", {
                _configContent: { Swidth: "50%", Smargin: "0px auto 0px auto" },
                _configHead: { Sborder: "none" },
                _configFoot: { Sborder: "none", SmarginTop: "0px" },
                _titleText: title,
                _body: X.createElement("LABEL"),
                _foot: X.createElement("BUTTON", {
                    Fclick: () => alertModal.toggle(false),
                    innerHTML: "OK",
                    className: "btn btn-default"
                })
            });

            alertModal.getElementsByTagName("LABEL")[0].innerHTML = text;
            alertModal.toggle(true, { _clickOut: true });
            return alertModal;
        };

        X.modal.confirm = (function () {
            let okClick = null,
                cancelClick = null;

            return function (text, func, footConfig = {}) {
                const confirmModal = X.modal("x-modal-confirm", {
                        _CloseBtn: false,
                        _configHead: { Sdisplay: "none" },
                        _body: X.createElement("LABEL"),
                        _foot: [
                            X.createElement("BUTTON", footConfig._cancelButton || {
                                innerHTML: "Cancela", className: "btn btn-secondary"
                            }),
                            X.createElement("BUTTON", footConfig._okButton || {
                                innerHTML: "OK", className: "btn btn-primary"
                            })]
                    }),
                    cancelBtn = confirmModal.getElementsByTagName("BUTTON")[0],
                    okBtn = confirmModal.getElementsByTagName("BUTTON")[1];

                cancelBtn.removeEventListener("click", cancelClick);
                okBtn.removeEventListener("click", okClick);

                confirmModal.getElementsByTagName("LABEL")[0].innerHTML = text;
                cancelClick = function () {
                    confirmModal.toggle(false);
                    func(false);
                };
                cancelBtn.addEventListener("click", cancelClick);
                okClick = function () {
                    confirmModal.toggle(false);
                    func(true);
                };
                okBtn.addEventListener("click", okClick);

                confirmModal.toggle(true);
                return confirmModal;
            };
        })();

        X.modal.prompt = (function () {
            let promptFunc = null;

            return function (text, func) {
                const promptModal = X.modal("x-modal-prompt", {
                        _foot: false,
                        _CloseBtn: false,
                        _configHead: { Sdisplay: "none" },
                        _configBody: { SpaddingTop: "none" },
                        _configFoot: { Sdisplay: "none" },
                        _body: [
                            X.createElement("LABEL"),
                            X.createElement("BR"),
                            X.createElement("DIV", { className: "input-group" })
                                .append("INPUT", { type: "text", className: "form-control", SmaxWidth: "none" })
                                .append(X.createElement("SPAN", { className: "input-group-btn" })
                                    .append("BUTTON", { className: "btn btn-defaul", type: "button", innerHTML: "OK", Sborder: "none" })
                                )
                        ]
                    }),
                    confirmBtn = promptModal.getElementsByTagName("BUTTON")[0],
                    input = promptModal.getElementsByTagName("INPUT")[0];

                confirmBtn.removeEventListener("click", promptFunc);

                promptModal.getElementsByTagName("LABEL")[0].innerHTML = text;
                input.value = "";
                promptFunc = function () {
                    promptModal.toggle(false);
                    func(input.value);
                };
                confirmBtn.addEventListener("click", promptFunc);
                promptModal.toggle(true);
                return promptModal;
            };
        })();

        /*
        Construtor:
            titleConfig: (Objeto) Objeto com as configurações do Title:
                _style: (Objeto) Objeto com as configurações de estilo do Title;
                _delay: (Float) Tempo em milisegundos de fade-in do Title. Default: 20;
                _name: (String) Nome do atributo e do id do Elemento do Title. Default: data-x-title;
        */
        X.title = function (titleConfig = {}) {
            const defaultTitleStyle = {
                    padding: "3px",
                    border: "1px solid black",
                    "border-radius": "5px",
                    "box-shadow": "2px 2px 5px grey",
                    background: "white",
                    color: "black",
                    font: "normal 11px Verdana",
                    "text-align": "left",
                    position: "absolute",
                    "z-index": 1000
                },
                getPlace = (evt) => titleElement.config({ Sleft: `${evt.pageX + 12}px`, Stop: `${evt.pageY + 20}px` });

            let titleAttribute = "data-x-title",
                titleDelay = 20;

            function showTitle(text) {
                X.show(titleElement, true, titleDelay);
                titleElement.innerHTML = text;
            }

            function hideTitle() {
                X.show(titleElement, false);
                titleElement.innerHTML = "";
            }

            //Renderiza o Title.
            this.renderTitle = function () {
                X.show(titleElement, false);
                X("[title]").forEach(function (el) {
                    el.setAttribute(titleAttribute, el.title);
                    el.removeAttribute("title");
                    el.onmouseover = () => showTitle(el.getAttribute(titleAttribute));
                    el.onmouseout = hideTitle;
                });

                Array.from(document.getElementsByTagName("title")).forEach(function (el) {
                    if (el.parentNode.tagName !== "HEAD") {
                        el.parentNode.setAttribute(titleAttribute, el.innerHTML);
                        el.remove();
                        el.parentNode.onmouseover = () => showTitle(el.parentNode.getAttribute(titleAttribute));
                        el.parentNode.onmouseout = hideTitle;
                    }
                });
            };

            //Inicia o Title.
            this.start = function () {
                document.onmousemove = getPlace;
                document.addEventListener(X.getBrowser() !== "firefox" ? "mousewheel" : "DOMMouseScroll", getPlace, false);
                this.renderTitle();
            };

            if (titleConfig._style)
                Object.assign(defaultTitleStyle, titleConfig._style);

            titleDelay = titleConfig._delay || titleDelay;
            titleAttribute = titleConfig._name || titleAttribute;
            let titleElement = document.getElementById(titleAttribute) ||
                document.body.appendChild(X.createElement("DIV", {
                    id: titleAttribute, style: defaultTitleStyle
                }));
        };

        /*
        Construtor:
            element: (String OU HtmlElement) String com o id do Elemento OU o Elemento que irá mostrar o resultado,
                se não for enviado, apresentará o resultado via console.log;
        */
        X.Derick = function (element) {
            let startTime,
                diffTime,
                chronoValue,
                chronoInterval = null,
                clockInterval = null;

            function chrono(endTime = new Date()) {
                diffTime = new Date(endTime - startTime);
                diffTime.setHours(endTime.getHours() - startTime.getHours());
                setTime(diffTime, true);
            }

            function setTime(time, showMsec) {
                let msec = time.getMilliseconds();
                let sec = time.getSeconds();
                let min = time.getMinutes();
                let hr = time.getHours();
                if (hr < 0) hr = 24 + hr;
                if (hr < 10) hr = `0${hr}`;
                if (min < 10) min = `0${min}`;
                if (sec < 10) sec = `0${sec}`;
                if (msec < 10) msec = `00${msec}`;
                else if (msec < 100) msec = `0${msec}`;
                msec = showMsec ? `:${msec}` : "";
                setChronoValue(`${hr}:${min}:${sec}${msec}`);
            }

            function pauseChrono() {
                if (chronoInterval) {
                    clearInterval(chronoInterval);
                    chronoInterval = null;
                }
            }

            function pauseClock() {
                if (clockInterval) {
                    clearInterval(clockInterval);
                    clockInterval = null;
                }
            }

            function pauseAll() {
                pauseChrono();
                pauseClock();
            }

            function setChronoValue(value) {
                chronoValue = value;
                if (element)
                    element.innerHTML = chronoValue;
            }

            this.start = function () {
                pauseClock();
                startTime = new Date();
                chronoInterval = setInterval(chrono);
            };

            this.continue = function () {
                const date = new Date();
                pauseClock();
                startTime = new Date(date - diffTime);
                startTime.setHours(date.getHours() - diffTime.getHours());
                chronoInterval = setInterval(chrono);
            };

            this.reset = function () {
                pauseAll();
                setChronoValue("00:00:00:000");
                startTime = new Date();
            };

            //Mostra o tempo atual
            this.clock = function () {
                pauseAll();
                setTime(new Date(), false);
                clockInterval = setInterval(() => setTime(new Date(), false), 500);
            };

            /* Retorno: (Date) Tempo atual apresentado; */
            this.getTime = () => diffTime;

            /* Retorno: (String) Tempo atual apresentado; */
            this.getValue = () => chronoValue;

            /*
            Parametros:
                deadline: (String OU Date) Data limite em String ou em Date;
            */
            this.countdown = function (deadline) {
                let date = null;
                switch (X.typeOf(deadline)) {
                    case "date": date = deadline; break;
                    case "string": {
                        date = new Date();
                        let [, hours, minutes, seconds, milliseconds] =
                            deadline.match(/(\d+)(?::(\d\d))?(?::(\d\d))?(?::(\d+))?/);
                        date.setHours((date.getHours() - 1) + parseInt(hours));
                        date.setMinutes(date.getMinutes() + parseInt(minutes) || 0);
                        date.setSeconds(date.getSeconds() + parseInt(seconds) || 0);
                        date.setMilliseconds(date.getMilliseconds() + parseInt(milliseconds) || 0);
                        break;
                    }
                    default: date = new Date();
                }
                pauseAll();
                chronoInterval = setInterval(() => {
                    startTime = new Date();
                    return chrono(date);
                });
            };

            this.pause = pauseChrono;

            element = typeof element === "string" ? document.getElementById(element) : element;
        };
    })();

    return X;
})();