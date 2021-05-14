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

let balance = 0;

function Quest(qName, qDif, qImp, qMot) {
	this.name = qName;
	this.difficulty = qDif;
	this.importancy = qImp;
	this.motivation = qMot;
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

	if(localStorage.getItem('quests') === null) {
		quests = [];
	} else {
		quests = JSON.parse(localStorage.getItem('quests'));
	}

	quests.forEach(function (quest) {
		const li = document.createElement('li');
		li.className = 'collection__item';
		li.appendChild(document.createTextNode(quest));
		const check = document.createElement('a');
		check.className = 'check-item';
		check.innerHTML = '<i class="fa fa-check"></i>'; 
		const cross = document.createElement('a');
		cross.className = 'delete-item';
		cross.innerHTML = '<i class="fa fa-remove"> </i>';
		li.appendChild(cross);
		li.appendChild(check);
		questList.appendChild(li);
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
		}
		console.log(quest);
		const li = document.createElement('li');
		li.className = 'collection__item';
		li.appendChild(document.createTextNode(quest.name));
		if (quest.description != undefined) {
			const textdscr = document.createElement('div');
			textdscr.className = 'input__Text';
			textdscr.innerHTML = `${quest.description.split('\n').join('<br>')}`;
			li.appendChild(textdscr);
		}
		const check = document.createElement('a');
		check.className = 'check-item';
		check.innerHTML = '<i class="fa fa-check"> </i>'; 
		const cross = document.createElement('a');
		cross.className = 'delete-item';
		cross.innerHTML = '<i class="fa fa-remove"></i>';
		li.appendChild(cross);
		li.appendChild(check);

		questList.appendChild(li);

		storeQuestsInLs(questName.value);

		questName.value = '';

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

function removeQuest(e) {
	if(e.target.parentElement.classList.contains('delete-item')) {
		e.target.parentElement.parentElement.remove();
		removeQuestFromLs(e.target.parentElement.parentElement.firstChild);	
	}
}

function doneQuest(e) {
	if(e.target.parentElement.classList.contains('check-item')) {
		console.log(e.target.parentElement.parentElement.firstChild);
		e.target.parentElement.parentElement.remove();
		removeQuestFromLs(e.target.parentElement.parentElement.firstChild);
	}
}

function removeQuestFromLs(questItem) {
	let quests;

	if(localStorage.getItem('quests') === null) {
		quests = [];
	} else {
		quests = JSON.parse(localStorage.getItem('quests'));
	}
	quests.forEach(function (quest, index) {
		if(questItem.textContent === quest) {
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