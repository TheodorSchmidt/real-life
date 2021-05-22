"use strict";
const questForm = document.querySelector('#questForm');
const tavernForm = document.querySelector('#tavernForm');
const questList = document.querySelector('.collection');
const clearBtn = document.querySelector('#clearAll');
const clearJrnl = document.querySelector('#clearJournal');
const filter = document.querySelector('#filter');
const questName = document.querySelector('#quest');
const questDescription = document.querySelector('#description');
const questDifficulty = document.querySelector('#difficulty');
const questImportancy = document.querySelector('#importancy');
const questDeadline = document.querySelector('#datepicker');
const questMotivation = document.querySelector('#motivation');
const restName = document.querySelector('#rest');
const restSatisfaction = document.querySelector('#satisfaction');
const restBenefit = document.querySelector('#benefit');
const restTime = document.querySelector('#restTime');
const journal = document.querySelector('.old-collection');

const balanceValue = document.querySelector('#balance');

function Quest(qName, qDif, qImp, qMot) {
	this.id = getGlobalID() + 1;
	incrGlobalID();
	this.name = qName;
	this.difficulty = qDif;
	this.importancy = qImp;
	this.motivation = qMot;
	this.dateModif = 1;
	this.reward = Math.trunc(this.difficulty * this.importancy * this.motivation * this.dateModif);
	this.completed = false;
}

function Rest(rName, rSat, rBen, rTime) {
	this.id = getGlobalID() + 1;
	incrGlobalID();
	this.name = rName;
	this.satisfaction = rSat;
	this.benefit = rBen;
	this.time = rTime;
	this.cost = Math.trunc(this.satisfaction * this.benefit * this.time); 
}

loadEventListeners();

function loadEventListeners() {
	document.addEventListener('DOMContentLoaded', getQuests);

	document.addEventListener('DOMContentLoaded', getJournal);

	questForm.addEventListener('submit', addQuest);

	tavernForm.addEventListener('submit', takeRest);

	questList.addEventListener('click', removeQuest);
	
	questList.addEventListener('click', doneQuest);

	journal.addEventListener('click', backNote);

	clearBtn.addEventListener('click', clearQuests);

	clearJrnl.addEventListener('click', clearJournal);
	
	filter.addEventListener('keyup', filterQuests);
}

function getQuests() {
	let quests;
	let balance;

	if (localStorage.getItem('quests') === null) {
		quests = [];
	} else {
		quests = JSON.parse(localStorage.getItem('quests'));
	}
	if (localStorage.getItem('balance') === null) {
		balance = 0;
	} else {
		balance = JSON.parse(localStorage.getItem('balance'));
	}
	
	balanceValue.innerHTML = `Баланс: ${balance}$`;

	quests.forEach(function (quest) {
		if (quest.completed == false) { 	
			printQuest(quest);
		}
	});
}

function addQuest(e) {
	if(questName.value === '' || questDifficulty.value === '0' || questImportancy.value === '0' || questMotivation.value === '0') {
		alert('Не введено название задачи или не выбрана одна или несколько характеристик (сложность, важность, замотивированность)');
	} else {
		let quest = new Quest(questName.value, questDifficulty.value, questImportancy.value, questMotivation.value);
		if (questDescription.value != '') {
			quest.description = questDescription.value;
		}
		if (questDeadline.value != '') {
			quest.deadline = questDeadline.value;
			quest.diffDays = calcDiffDays(quest.deadline);
		}
		
		printQuest(quest);

		storeQuestsInLs(quest);

		questName.value = '';
		questDescription.value = '';
		questDifficulty.value = '0';
		questImportancy.value = '0';
		questMotivation.value = '0';
		questDeadline.value = '';

		e.preventDefault();
	}
}

function storeQuestsInLs(quest) {
	let quests;

	if(localStorage.getItem('quests') === null) {
		quests = [];
	} else {
		quests = JSON.parse(localStorage.getItem('quests'));
	}
	quests.push(quest);

	localStorage.setItem('quests', JSON.stringify(quests));
}

function storeBalanceInLs(value) {
	let balance;
	if (localStorage.getItem('balance') === null) {
		balance = 0;
	} else {
		balance = JSON.parse(localStorage.getItem('balance'));
	}
	if (value > 0) {
		alert(`Баланс увеличен на ${value}$`);
	} else {
		alert(`Баланс уменьшен на ${-value}$`);
	}
	balance += value;
	balanceValue.innerHTML = `Баланс: ${balance}$`;
	localStorage.setItem('balance', JSON.stringify(balance));
}

function getBalance() {
	let balance;
	if (localStorage.getItem('balance') === null) {
		balance = 0;
	} else {
		balance = JSON.parse(localStorage.getItem('balance'));
	}
	return balance;
}

function getGlobalID() {
	let globalId;
	if (localStorage.getItem('globalId') === null) {
		globalId = 0;
	} else {
		globalId = JSON.parse(localStorage.getItem('globalId'));
	}
	return globalId;
}

function incrGlobalID() {
	let globalId;
	if (localStorage.getItem('globalId') === null) {
		globalId = 0;
	} else {
		globalId = JSON.parse(localStorage.getItem('globalId'));
	}
	globalId += 1;
	localStorage.setItem('globalId', JSON.stringify(globalId));
}

function storeJournalNoteInLs(object) {
	let notes;
	if(localStorage.getItem('notes') === null) {
		notes = [];
	} else {
		notes = JSON.parse(localStorage.getItem('notes'));
	}
	notes.push(object);
	localStorage.setItem('notes', JSON.stringify(notes));
}

function removeJournalNoteFromLs(journal, flag) {
	let notes;
	if(localStorage.getItem('notes') === null) {
		notes = [];
	} else {
		notes = JSON.parse(localStorage.getItem('notes'));
	}
	notes.forEach(function (object, index) {
		if(journal.textContent == object.id) {
			if (flag == true && object.completed != undefined) {
				let quests;
				if(localStorage.getItem('quests') === null) {
					quests = [];
				} else {
					quests = JSON.parse(localStorage.getItem('quests'));
				}
				quests.forEach(function (quest) {
					if(object.id == quest.id) {
						quest.completed = false;
						quest.dateCompleted = undefined;
					}
				});
				localStorage.setItem('quests', JSON.stringify(quests));
				getQuests();
			}
			notes.splice(index, 1);
		}
	});
	localStorage.setItem('notes', JSON.stringify(notes));
	getJournal();
}

function removeQuest(e) { //удаляем квест, не сохраняем в журнале
	if(e.target.parentElement.classList.contains('delete-item')) {
		e.target.parentElement.parentElement.remove(); 
		removeQuestFromLs(e.target.parentElement.parentElement.firstChild.nextSibling.firstChild, false);	
	}
}

function doneQuest(e) { //удаляем квест, сохраняем в журнале
	if(e.target.parentElement.classList.contains('check-item')) {
		e.target.parentElement.parentElement.remove();
		removeQuestFromLs(e.target.parentElement.parentElement.firstChild.nextSibling.firstChild, true);
	}
}

function removeQuestFromLs(questItem, flag) {
	let quests;

	if(localStorage.getItem('quests') === null) {
		quests = [];
	} else {
		quests = JSON.parse(localStorage.getItem('quests'));
	}
	quests.forEach(function (quest, index) {
		if(questItem.textContent == quest.id) {
			if (flag == true) {
				storeBalanceInLs(quest.reward);
				quest.dateCompleted = today();
				printJournalNote(quest);
				storeJournalNoteInLs(quest);
				quest.completed = true;
			} else {
				quests.splice(index, 1);
			}
			localStorage.setItem('quests', JSON.stringify(quests));
			getQuests();
		}
	});	
}

function clearQuests() {
	while(questList.firstChild) {
		questList.removeChild(questList.firstChild);
	}

	clearLs();
}

function clearLs() {
	localStorage.clear();
	getQuests();
	getJournal();
}

function filterQuests(e) {
	const filterText = e.target.value.toLowerCase();

	document.querySelectorAll('.collection__item').forEach
	(function(quest) {
		const filteredQuest = quest.firstChild.textContent;
		if(filteredQuest.toLowerCase().indexOf(filterText) !== -1) {
			quest.style.display = 'block';
		} else {
			quest.style.display = 'none';
		}
	});
}

function printQuest(quest) {
	const li = document.createElement('li');
	li.className = 'collection__item';
	li.appendChild(document.createTextNode(quest.name));
	const ind = document.createElement('a');
	ind.innerHTML = `${quest.id}<br>`;
	ind.style = "margin-left: 20px; color: rgba(13, 128, 51, 0.76)";
	li.appendChild(ind);
	if (quest.description != undefined) {
		const textdscr = document.createElement('div');
		textdscr.style.cssText = "color: rgba(158,152,158,0.76); font-size: 24px";
		textdscr.innerHTML = `${quest.description.split('\n').join('<br>')}`;
		li.appendChild(textdscr);
	}
	if (quest.deadline != undefined) {
		const dline = printDeadline(quest);
		li.appendChild(dline); 
	}
	const rew = document.createElement('span');
	rew.style.cssText = "color: rgba(13, 128, 51, 0.76); font-size: 24px";
	rew.innerHTML = `Награда при выполнении: ${quest.reward}$`;
	const check = document.createElement('a');
	check.className = 'check-item';
	check.innerHTML = '<i class="fa fa-check"></i>'; 
	const cross = document.createElement('a');
	cross.className = 'delete-item';
	cross.innerHTML = '<i class="fa fa-remove"> </i>';
	li.appendChild(rew);
	li.appendChild(cross);
	li.appendChild(check);
	questList.appendChild(li);
}

function calcDiffDays(date) {
	let today = new Date();
	let deadline = new Date(date);
	let timeDiff = deadline.getTime() - today.getTime();
	return (Math.ceil(timeDiff / (1000 * 3600 * 24)));
}

function printDeadline(quest) {
	quest.diffDays = calcDiffDays(quest.deadline);
	const diffDays = quest.diffDays;
	const deadline = quest.deadline;
	const dline = document.createElement('div');
	if (diffDays < 0) {
		dline.style.cssText = "color: rgb(206, 0, 0); font-size: 24px";
		if (diffDays <= -1 && diffDays > -3) {
			dline.innerHTML = `${deadline} (просрочено на ${Math.abs(diffDays)} дней, текущий штраф 10%)`;
			newDateModif(quest, 0.9);
		} else if (diffDays <= -3 && diffDays > -7) {
			dline.innerHTML = `${deadline} (просрочено на ${Math.abs(diffDays)} дней, текущий штраф 30%)`;
			newDateModif(quest, 0.7);
		} else if (diffDays <= -7 && diffDays > -14) {
			dline.innerHTML = `${deadline} (просрочено на ${Math.abs(diffDays)} дней, текущий штраф 40%)`;
			newDateModif(quest, 0.6);
		} else if (diffDays <= -14 && diffDays > -28) {
			dline.innerHTML = `${deadline} (просрочено на ${Math.abs(diffDays)} дней, текущий штраф 60%)`;
			newDateModif(quest, 0.4);
		} else if (diffDays <= -28) {
			newDateModif(quest, 0.2);
			dline.innerHTML = `${deadline} (просрочено на ${Math.abs(diffDays)} дней, текущий штраф 80%)`;
		}
	} else if (diffDays >= 0 && diffDays < 7) {
		dline.style.cssText = "color: rgb(221, 217, 0); font-size: 24px";
		if (diffDays == 0) {
			dline.innerHTML = `${deadline} (истекает сегодня)`;
		} else if (diffDays == 1) {
			dline.innerHTML = `${deadline} (истекает завтра)`;
		} else if (diffDays == 2) {
			dline.innerHTML = `${deadline} (истекает через 2 дня)`;
		} else if (diffDays == 3) {
			dline.innerHTML = `${deadline} (истекает через 3 дня)`;
		} else {
			dline.innerHTML = `${deadline} (истекает через неделю)`;
		}
	} else {
		dline.style.cssText = "color: rgb(0, 207, 35); font-size: 24px";
		if (diffDays >= 7 && diffDays < 14) {
			dline.innerHTML = `${deadline} (истекает через 1-2 недели, текущий бонус 30%)`;
			newDateModif(quest, 1.3);
		} else if (diffDays >= 14 && diffDays < 28) {
			dline.innerHTML = `${deadline} (истекает через 2-4 недели, текущий бонус 60%)`;
			newDateModif(quest, 1.6);
		} else {
			dline.innerHTML = `${deadline} (истекает больше чем через 4 недели, текущий бонус 100%)`;
			newDateModif(quest, 2);
		}
	}
	return dline;
}

function newDateModif(quest, i) {
	quest.reward /= quest.dateModif;
	quest.dateModif = i;
	quest.reward *= quest.dateModif;
}

function today() {
	let today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();
	today = mm + '/' + dd + '/' + yyyy;
	return today;
}

function takeRest(e) {
	if (restName.value === '' || restSatisfaction === '0' || restBenefit === '0' || restTime === '0') {
		alert('Не введено название отдыха и/или не выбрана одна или несколько характеристик');
	} else {
		let rest = new Rest(restName.value, restSatisfaction.value, restBenefit.value, restTime.value);
		if (rest.cost > getBalance()) {
			alert(`Отдых стоит ${rest.cost}$, у вас на счету ${getBalance()}$ - вы не можете позволить себе этот отдых`);
		} else {
			storeBalanceInLs(-rest.cost);
			rest.dateCompleted = today();
			storeJournalNoteInLs(rest);
			printJournalNote(rest);
			restName.value = '';
			restSatisfaction.value = '0';
			restBenefit.value = '0';
			restTime.value = '0';
		}

		e.preventDefault();
	}
}

function getJournal() {
	let notes; 
	if (localStorage.getItem('notes') === null) {
		notes = [];
	} else {
		notes = JSON.parse(localStorage.getItem('notes'));
	}
	notes.forEach(function (object) {
		console.log(object.completed); 
		printJournalNote(object); 
	});
}

function printJournalNote(object) {
	const li = document.createElement('li');
	li.className = 'collection__item';

	const date = document.createElement('span');
	date.style = "color: rgba(158, 152, 158, 0.76); margin-right: 20px";
	date.innerHTML = `${object.dateCompleted}`;
	li.appendChild(date);

	const name = document.createElement('span'); 
	name.innerHTML = `${object.name}`;
	li.appendChild(name);
	
	const val = document.createElement('span');
	if (object.cost != undefined) {
		val.style = "color: rgb(206, 0, 0); margin-left: 20px; margin-right: 20px"; 
		val.innerHTML = `-${object.cost}$`;
	} else if (object.reward != undefined) {
		val.style = "color: rgb(0, 207, 35); margin-left: 20px; margin-right: 20px";
		val.innerHTML = `+${object.reward}$`;
	}	
	li.appendChild(val);

	const ind = document.createElement('span');
	ind.style = "margin-left: 20px"
	ind.innerHTML = `${object.id}`;
	li.appendChild(ind);
	
	const back = document.createElement('a');
	back.className = 'back-item';
	back.innerHTML = '<i class="fa fa-share"></i>';
	li.appendChild(back);

	journal.appendChild(li);
}

function backNote(e) {
	if(e.target.parentElement.classList.contains('back-item')) {
		let val = e.target.parentElement.parentElement.lastChild.previousSibling.previousSibling.firstChild.textContent;
		let id = e.target.parentElement.parentElement.lastChild.previousSibling.firstChild;
		console.log(val, id);
		if (val.substr(0, 1) === '-') {
			val = val.replace(/[^0-9]/g, '');
		} else {
			val = -val.replace(/[^0-9]/g, '');
		}
		storeBalanceInLs(Number(val)); 
		e.target.parentElement.parentElement.remove();
		removeJournalNoteFromLs(id, true);
		window.location.reload();
	}
}

function clearJournal() {
	let quests;
	if(localStorage.getItem('quests') === null) {
		quests = [];
	} else {
		quests = JSON.parse(localStorage.getItem('quests'));
	}
	quests.forEach(function (quest, index) {
		if (quest.completed == true) {
			quests.splice(index, 1);
		} 
	});	
	localStorage.setItem('quests', JSON.stringify(quests));
	
	let notes; 
	if(localStorage.getItem('notes') === null) {
		notes = [];
	} else {
		notes = JSON.parse(localStorage.getItem('notes'));
	}
	notes = [];
	localStorage.setItem('notes', JSON.stringify(notes));

	getQuests();
	getJournal();
	window.location.reload();
}