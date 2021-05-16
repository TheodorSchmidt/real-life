"use strict";
const form = document.querySelector('#questForm');
const questList = document.querySelector('.collection');
const clearBtn = document.querySelector('.btn_clear');
const filter = document.querySelector('#filter');
const questName = document.querySelector('#quest');
const questDescription = document.querySelector('#description');
const questDifficulty = document.querySelector('#difficulty');
const questImportancy = document.querySelector('#importancy');
const questDeadline = document.querySelector('#datepicker');
const questMotivation = document.querySelector('#motivation');
const oldQuestList = document.querySelector('.old-collection');

const balanceValue = document.querySelector('#balance');

function Quest(qName, qDif, qImp, qMot) {
	this.name = qName;
	this.difficulty = qDif;
	this.importancy = qImp;
	this.motivation = qMot;
	this.dateModif = 1;
	this.reward = Math.trunc(this.difficulty * this.importancy * this.motivation * this.dateModif);
	this.completed = false;
}

loadEventListeners();

function loadEventListeners() {
	document.addEventListener('DOMContentLoaded', getQuests);

	form.addEventListener('submit', addQuest);

	questList.addEventListener('click', removeQuest);
	
	questList.addEventListener('click', doneQuest);

	clearBtn.addEventListener('click', clearQuests);

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
	console.log(balance);
	balanceValue.innerHTML = `Текущий баланс: ${balance}$`;

	quests.forEach(function (quest) {
		printQuest(quest);
	});
}

function addQuest(e) {
	if(questName.value === '' || questDifficulty.value === '0' || questImportancy.value === '0' || questMotivation.value === '0') {
		alert('Не введено название задачи или не выбрана одна из характеристик (сложность, важность, замотивированность)');
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
	balance += value;
	localStorage.setItem('balance', JSON.stringify(balance));
}


function removeQuest(e) { //удаляем квест, не сохраняем в журнале
	if(e.target.parentElement.classList.contains('delete-item')) {
		e.target.parentElement.parentElement.remove();
		removeQuestFromLs(e.target.parentElement.parentElement.firstChild, false);	
	}
}

function doneQuest(e) { //удаляем квест, сохраняем в журнале
	if(e.target.parentElement.classList.contains('check-item')) {
		e.target.parentElement.parentElement.remove();
		removeQuestFromLs(e.target.parentElement.parentElement.firstChild, true);
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
		if(questItem.textContent === quest.name) {
			if (flag == true) {
				storeBalanceInLs(quest.reward);
			}
			quests.splice(index, 1);
		}
	});

	localStorage.setItem('quests', JSON.stringify(quests));
}

function clearQuests() {
	while(questList.firstChild) {
		questList.removeChild(questList.firstChild);
	}

	clearLs();
}

function clearLs() {
	localStorage.clear();
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
	rew.innerHTML = `<br>Награда при выполнении: ${quest.reward}$`;
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
	let timeDiff = Math.abs(deadline.getTime() - today.getTime());
	return (Math.ceil(timeDiff / (1000 * 3600 * 24)));
}

function printDeadline(quest) {
	const diffDays = quest.diffDays;
	const deadline = quest.deadline;
	const dline = document.createElement('span');
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