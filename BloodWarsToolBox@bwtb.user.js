(function(){
// coding: utf-8
// ==UserScript==
// @author      Ecilam
// @name        Blood Wars ToolBox
// @version     2014.07.12
// @namespace   BWTB
// @description Script pour Blood Wars permettant d'envoyer les données au site de Cramo http://www.bloodwartoolbox.eu/accueil
// @copyright   2014-2014, Ecilam
// @license     GPL version 3 ou suivantes; http://www.gnu.org/copyleft/gpl.html
// @homepageURL https://github.com/Ecilam/BloodWarsToolBox
// @supportURL  https://github.com/Ecilam/BloodWarsToolBox/issues
// @include     /^http:\/\/r[0-9]*\.fr\.bloodwars\.net\/.*$/
// @grant       GM_xmlhttpRequest
// ==/UserScript==
"use strict";

function _Type(value){
	var type = Object.prototype.toString.call(value);
	return type.slice(8,type.length-1);
	}
	
function _Exist(value){
	return _Type(value)!='Undefined';
	}

// passe l'objet par valeur et non par référence
function clone(objet){
	if(typeof objet!='object'||objet==null) return objet;
	var newObjet = objet.constructor();
	for(var i in objet)	newObjet[i] = clone(objet[i]);
	return newObjet;
	}

/******************************************************
* OBJET JSONS - JSON
* - stringification des données
******************************************************/
var JSONS = (function(){
	function reviver(key,value){
		if (_Type(value)=='String'){
			var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
			if (a!=null) return new Date(Date.UTC(+a[1],+a[2]-1,+a[3],+a[4],+a[5],+a[6]));
			}
		return value;
		}
	return {
		_Decode: function(value){
			var result = null;
			try	{
				result = JSON.parse(value,reviver);
				}
			catch(e){
				console.error('JSONS_Decode error :',value,e);
				}
			return result;
			},

		_Encode: function(value){
			return JSON.stringify(value);
			}
		};
	})();

/******************************************************
* OBJET LS - Datas Storage
* - basé sur localStorage
* Note : localStorage est lié au domaine
******************************************************/
var LS = (function(){
	var LS = window.localStorage;
	return {
		_GetVar: function(key,defaut){
			var value = LS.getItem(key); // if key does not exist return null 
			return ((value!=null)?JSONS._Decode(value):defaut);
			},
		_SetVar: function(key,value){
			LS.setItem(key,JSONS._Encode(value));
			return value;
			},
		};
	})();

/******************************************************
* OBJET DOM - Fonctions DOM & QueryString
* -  DOM : fonctions d'accès aux noeuds du document
* - _QueryString : accès aux arguments de l'URL
******************************************************/
var DOM = (function(){
	return {
		_GetNodes: function(path,root){
			var contextNode=(_Exist(root)&&root!=null)?root:document;
			var result=document.evaluate(path, contextNode, null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			return result;
			},
		_GetFirstNode: function(path,root){
			var result = this._GetNodes(path,root);
			return ((result.snapshotLength >= 1)?result.snapshotItem(0):null);
			},
		_GetFirstNodeTextContent: function(path,defaultValue,root){
			var result = this._GetFirstNode(path,root);
			return (((result!=null)&&(result.textContent!=null))?result.textContent:defaultValue);
			},
		_GetFirstNodeInnerHTML: function(path,defaultValue,root){
			var result = this._GetFirstNode(path,root);
			return (((result!=null)&&(result.innerHTML!=null))?result.innerHTML:defaultValue);
			},
		_QueryString: function(key){
			var url = window.location.search,
				reg = new RegExp("[\?&]"+key+"(=([^&$]+)|)(&|$)","i"),
				offset = reg.exec(url);
			if (offset!=null){
				offset = _Exist(offset[2])?offset[2]:true;
				}
			return offset;
			}
		};
	})();

/******************************************************
* OBJET IU - Interface Utilsateur
******************************************************/
var IU = (function(){
	return {
		_CreateElements: function(list){
			var result = {};
			for (var key in list){
				var type = _Exist(list[key][0])?list[key][0]:null,
					attributes = _Exist(list[key][1])?list[key][1]:{},
					content = _Exist(list[key][2])?list[key][2]:[],
					events = _Exist(list[key][3])?list[key][3]:{},
					node = _Exist(result[list[key][4]])?result[list[key][4]]:(_Exist(list[key][4])?list[key][4]:null);
				if (type!=null) result[key] = this._CreateElement(type,attributes,content,events,node);
				}
			return result;
			},
		_CreateElement: function(type,attributes,content,events,node){
			if (_Exist(type)&&type!=null){
				attributes = _Exist(attributes)?attributes:{};
				content = _Exist(content)?content:[];
				events = _Exist(events)?events:{};
				node = _Exist(node)?node:null;
				var result = document.createElement(type);
				for (var key in attributes){
					if (_Type(attributes[key])!='Boolean') result.setAttribute(key,attributes[key]);
					else if (attributes[key]==true) result.setAttribute(key,key.toString());
					}
				for (var key in events){
					this._addEvent(result,key,events[key][0],events[key][1]);
					}
				for (var i=0; i<content.length; i++){
					if (_Type(content[i])==='Object') result.appendChild(content[i]);
					else result.textContent+= content[i];
					}
				if (node!=null) node.appendChild(result);
				return result;
				}
			else return null;
			},
		_addEvent: function(obj,type,fn,par){
			var funcName = function(event){return fn.call(obj,event,par);};
			obj.addEventListener(type,funcName,false);
			if (!obj.BWEListeners) {obj.BWEListeners = {};}
			if (!obj.BWEListeners[type]) obj.BWEListeners[type]={};
			obj.BWEListeners[type][fn.name]=funcName;
			},
		};
	})();

/******************************************************
* OBJET L - localisation des chaînes de caractères
******************************************************/
var L = (function(){
	var locStr = {
		"sDeconnecte": "Vous avez été déconnecté en raison d`une longue inactivité.",
		"sCourtePause": "Une courte pause est en court en raison de l`actualisation du classement général",
		"sUnknowID": "BloorWarsToolBox - Erreur :\n\nLe nom de ce vampire doit être lié à son ID. Merci de consulter la Salle du Trône pour rendre le script opérationnel.\nCe message est normal si vous utilisez ce script pour la première fois ou si vous avez changé le nom du vampire.",
		};
	return {
	//public stuff
		_Get: function(key){
			var result = locStr[key];
			if (!_Exist(result)) throw new Error("L::Error:: la clé n'existe pas : "+key);
			return result;
			}
		};
	})();

/******************************************************
* OBJET DATAS - Fonctions d'accès aux données de la page
* Chaque fonction retourne 'null' en cas d'échec
******************************************************/
var DATAS = (function(){
	return {
	/* données du joueur */
		_PlayerName: function(){
			var playerName = DOM._GetFirstNodeTextContent("//div[@class='stats-player']/a[@class='me']", null);
			return playerName;
			},
	/* Données diverses	*/
		_GetPage: function(){
			var page = 'null',
			// message Serveur (à approfondir)
				result = DOM._GetFirstNode("//div[@class='komunikat']");
			if (result!=null){
				var result = DOM._GetFirstNodeTextContent(".//u",result);
				if (result == L._Get('sDeconnecte')) page="pServerDeco";
				else if (result == L._Get('sCourtePause')) page="pServerUpdate";
				else page="pServerOther";
				}
			else{
				var qsA = DOM._QueryString("a"),
					qsDo = DOM._QueryString("do"),
					qsMid = DOM._QueryString("mid"),
					path = window.location.pathname;
				// page extérieur
				if (path!="/"){}
				// page interne
				// Salle du Trône
				else if (qsA==null||qsA=="main") page="pMain";
				// Armurerie
				else if (qsA=="equip") page="pEquip";
				}
			return page;
			}
		};
	})();


/******************************************************
* OBJET PREF - Gestion des préférences
******************************************************/
var PREF = (function(){
	// préfèrences par défaut
	const index = 'BWTB:O:',
		defPrefs = {'tbMode':'0','tbMaj':0,'tbl1':'','tbl2':''};
	var ID = null, prefs = {};
	return {
		_Init: function(id){
			ID = id;
			prefs = LS._GetVar(index+id,{});
			},
		_Get: function(key){
			if (_Exist(prefs[key])) return prefs[key];
			else if (_Exist(defPrefs[key]))return defPrefs[key];
			else return null;
			},
		_Set: function(key,value){
			if (ID!=null){
				prefs[key] = value;
				LS._SetVar(index+ID,prefs);
				}
			},
		};
	})();

/******************************************************
* CSS
******************************************************/
function SetCSS(){
	const css = ".BWEHelp{border:0;vertical-align:middle;padding:3px 5px;}",
		head = DOM._GetFirstNode("//head");
	if (head!=null) IU._CreateElement('style',{'type':'text/css'},[css],{},head);
	}

/******************************************************
* FUNCTIONS
******************************************************/
// Page 'pEquip'
function encrypt(str) {
	var key = '3fbf06c4ecded44ac0fc1a4c5d47f0fcf7f44a8d',
		result = '';
	for (i=0;i<str.length;i++){
		result += String.fromCharCode(str.charCodeAt(i)^key.charCodeAt(i%key.length));
		}
	return result;
}
function inputTB(e,i){
	var mode = tbDiv['mode'].options[tbDiv['mode'].selectedIndex].value;
	if (mode=='1'||mode=='2'){PREF._Set(i,encrypt(tbDiv[i].value));}
	}
function modeTB(){
	var mode = tbDiv['mode'].options[tbDiv['mode'].selectedIndex].value;
	PREF._Set('tbMode',mode);
	PREF._Set('tbl1',encrypt(mode=='0'?'':tbDiv['tbl1'].value));
	PREF._Set('tbl2',encrypt(mode=='0'?'':tbDiv['tbl2'].value));
	tbDiv['send'].setAttribute('style','display:'+((mode=='2')?'none;':'inline;'));
	}
function sendToolbox(e,i){ // i[0]=royaume
	// adapté du code de Cramo http://bloodwartoolbox.eu/bloodwartoolbox.xpi
	var login = tbDiv['tbl1'].value,
		pass = tbDiv['tbl2'].value;
	if (login!=''&&pass!=''){
		var	code_source = DOM._GetFirstNodeInnerHTML("/html/body",null);
		if (code_source!=null){
			code_source = code_source.replace(/&/g,".");
			GM_xmlhttpRequest({
				method: "POST",
				url: "http://bloodwartoolbox.eu/traitement_charger.php",
				data: "login="+login+"&pass="+pass+"&royaume="+i[0]+"&code_brut="+code_source,
				headers: {"Content-Type": "application/x-www-form-urlencoded"},
				onreadystatechange: function(response){
					if(response.readyState == 0){
						tbDiv['td12'].textContent = 'Envoie de la requête...';
						tbDiv['td12'].setAttribute('class','incstat');
						}
					else if(response.readyState == 1){
						tbDiv['td12'].textContent = 'Connexion serveur établie...';
						tbDiv['td12'].setAttribute('class','incstat');
						}
					else if(response.readyState == 2){
						tbDiv['td12'].textContent = 'Requête reçue...';
						tbDiv['td12'].setAttribute('class','incstat');
						}
					else if(response.readyState == 3){
						tbDiv['td12'].textContent = 'Requête en cours de traitement...';
						tbDiv['td12'].setAttribute('class','incstat');
						}
					else if(response.readyState == 4){
						var tmp = response.responseText.split(":");
						if (typeof(tmp[0])!="undefined"){
							if(tmp[0]=="erreur1"){
								tbDiv['td12'].textContent = "Le couple login/password est invalide";
								tbDiv['td12'].setAttribute('class','error');
								}
							else if(tmp[0]=="erreur2"){
								tbDiv['td12'].textContent = "Erreur de transmission des données";
								tbDiv['td12'].setAttribute('class','error');
								}
							else if(tmp[0]=="ok"){
								PREF._Set('tbMaj',new Date());
								tbDiv['td02'].textContent = new Date().toLocaleString();
								tbDiv['td12'].textContent = 'OK';
								tbDiv['td12'].setAttribute('class','enabled');
								}
							}
						}
					},
				onerror: function(response){
					tbDiv['td12'].textContent = 'Erreur ('+response.readyState+' '+response.status+' '+response.statusText+')';
					tbDiv['td12'].setAttribute('class','error');
					}
				});
			} 
		else{
			tbDiv['td12'].textContent = 'Problème d\'accès au code source';
			tbDiv['td12'].setAttribute('class','error');
			}
		}
	else{
		tbDiv['td12'].textContent = 'Le login ToolBox n\'a pas été saisi';
		tbDiv['td12'].setAttribute('class','error');
		}
	}

/******************************************************
* START
*
******************************************************/
// vérification des services
if (!JSON) throw new Error("Erreur : le service JSON n\'est pas disponible.");
else if (!window.localStorage) throw new Error("Erreur : le service localStorage n\'est pas disponible.");
else{
	var page = DATAS._GetPage(),
		player = DATAS._PlayerName(),
		IDs = LS._GetVar('BWTB:IDS',{});
console.debug('BWTBpage :',page);
	if (['null','pServerDeco','pServerUpdate','pServerOther'].indexOf(page)==-1&&player!=null){
console.debug('BWTBstart: %o %o',player,IDs);
		if (page=='pMain'){
			var result = DOM._GetFirstNodeTextContent("//div[@class='throne-maindiv']/div/span[@class='reflink']",null);
			if (result!=null){
				var result2 = /r\.php\?r=([0-9]+)/.exec(result),
					ID = _Exist(result2[1])?result2[1]:null;
				if (ID!=null){
					for (var i in IDs) if (IDs[i]==ID) delete IDs[i]; // en cas de changement de nom
					IDs[player] = ID;
					LS._SetVar('BWTB:IDS',IDs);
					}
				}
			}
		else if (_Exist(IDs[player])){
			if (page=='pEquip'){
				var ID = IDs[player];
				PREF._Init(ID);
				SetCSS();
				var result = DOM._GetFirstNode("//div/form[@id='formularz']//parent::*"),
					serveur = new RegExp("^http\:\/\/r([1-6])\.fr\.bloodwars\.net").exec(location.href);
				if (result!=null&&serveur!=null){
					var tab = new Array("ut1","ut2","mor","ut3","mor2","ut4"),
						royaume = tab[serveur[1]-1],
						mode = PREF._Get('tbMode'),
						maj = PREF._Get('tbMaj');
					var tbIU = {
							'fieldset':['fieldset',{'class':'equip','style':'margin-top: 20px;'},,,result],
							'legend':['legend',{'class':'stashhdr'},['TOOLBOX - version '],,'fieldset'],
							'a1':['a',{'href':'https://github.com/Ecilam/BloodWarsToolBox','TARGET':'_blank'},[((typeof(GM_info)=='object')?GM_info.script.version:'?')],,'legend'],
							'table':['table',,,,'fieldset'],
							'tr0':['tr',,,,'table'],
							'td01':['td',,['Dernière MAJ'],,'tr0'],
							'td02':['td',{'class':'enabled'},[maj==0?'':maj.toLocaleString()],,'tr0'],
							'tr1':['tr',,,,'table'],
							'td11':['td',,['Statut'],,'tr1'],
							'td12':['td',,['-'],,'tr1'],
							'tr2':['tr',,,,'table'],
							'td21':['td',,['Identifiant'],,'tr2'],
							'td22':['td',,,,'tr2'],
							'tbl1':['input',{'class':'inputbox','type':'text','id':'logTB','size':'20','maxlength':'50','value':encrypt(PREF._Get('tbl1'))},,{'change':[inputTB,'tbl1'],'keyup':[inputTB,'tbl1']},'td22'],
							'tr3':['tr',,,,'table'],
							'td31':['td',,['Mot de passe'],,'tr3'],
							'td32':['td',,,,'tr3'],
							'tbl2':['input',{'class':'inputbox','type':'password','id':'passTB','size':'20','maxlength':'50','value':encrypt(PREF._Get('tbl2'))},,{'change':[inputTB,'tbl2'],'keyup':[inputTB,'tbl2']},'td32'],
							'tr4':['tr',,,,'table'],
							'td41':['td',,['Mode'],,'tr4'],
							'modeHelp':['img',{'class':'BWEHelp','src':'/gfx/hint2.png','onmouseout':'nd();',
							'onmouseover':"return overlib('Manuel: ne sauvegarde pas le login et efface l\\'existant.<br>Manuel/save: sauvegarde le login.<br>Semi-Auto 24h: sauvegarde le login. Au chargement de l\\'Armurerie, le script envoie automatiquement les données une fois par 24h',WIDTH,500,VAUTO,HAUTO);"},,,'td41'],
							'td42':['td',,,,'tr4'],
							'mode':['select',{'class':'combobox','id':'mode'},,{'change':[modeTB]},'td42'],
							'option1':['option',{'value':'0'},['Manuel'],,'mode'],
							'option2':['option',{'value':'1'},['Manuel/save'],,'mode'],
							'option3':['option',{'value':'2'},['Semi-Auto 24h'],,'mode'],
							'send':['input',{'class':'button','style':'display:'+(mode=='2'?'none;':'inline;'),'type':'button','value':'Envoi'},,{'click':[sendToolbox,[royaume]]},'td42']},
						tbDiv = IU._CreateElements(tbIU);
					tbDiv['mode'].selectedIndex = mode;
					if (mode=='2'&&new Date().getTime()>((maj==0?0:maj.getTime())+24*3600*1000)) sendToolbox(null,[royaume]);
					}
				}
			}
		else alert(L._Get("sUnknowID"));
		}
	}
console.debug('BWTBEnd');
})();
