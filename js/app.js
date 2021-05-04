"use strict";
const form = document.querySelector('#taskForm');
const taskList = document.querySelector('.collection');
const clearBtn = document.querySelector('.btn_clear');
const filter = document.querySelector('#filter');
const taskInput = document.querySelector('#task');
const oldTaskList = document.querySelector('.old-collection');

loadEventListeners();

function loadEventListeners() {
	document.addEventListener('DOMContentLoaded', getTasks);

	form.addEventListener('submit', addTask);

	taskList.addEventListener('click', removeTask);
	
	taskList.addEventListener('click', doneTask);

	clearBtn.addEventListener('click', clearTasks);

	filter.addEventListener('keyup', filterTasks);
}

function getTasks() {
	let tasks;

	if(localStorage.getItem('tasks') === null) {
		tasks = [];
	} else {
		tasks = JSON.parse(localStorage.getItem('tasks'));
	}

	tasks.forEach(function (task) {
		const li = document.createElement('li');
		li.className = 'collection__item';
		li.appendChild(document.createTextNode(task));
		const check = document.createElement('a');
		check.className = 'check-item';
		check.innerHTML = '<i class="fa fa-check"></i>'; 
		const cross = document.createElement('a');
		cross.className = 'delete-item';
		cross.innerHTML = '<i class="fa fa-remove"> </i>';
		li.appendChild(cross);
		li.appendChild(check);
		taskList.appendChild(li);
	});
}

function addTask(e) {
	if(taskInput.value === '') {
		alert('Напишите задачу');
	} else {
		const li = document.createElement('li');
		li.className = 'collection__item';
		li.appendChild(document.createTextNode(taskInput.value));
		const check = document.createElement('a');
		check.className = 'check-item';
		check.innerHTML = '<i class="fa fa-check"> </i>'; 
		const cross = document.createElement('a');
		cross.className = 'delete-item';
		cross.innerHTML = '<i class="fa fa-remove"></i>';
		li.appendChild(cross);
		li.appendChild(check);

		taskList.appendChild(li);

		storeTaskInLs(taskInput.value);

		taskInput.value = '';

		e.preventDefault();
	}
}

function storeTaskInLs(task) {
	let tasks;

	if(localStorage.getItem('tasks') === null) {
		tasks = [];
	} else {
		tasks = JSON.parse(localStorage.getItem('tasks'));
	}
	tasks.push(task);

	localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTask(e) {
	if(e.target.parentElement.classList.contains('delete-item')) {
		console.log(localStorage.getItem('tasks'));
		e.target.parentElement.parentElement.remove();
		removeTaskFromLs(e.target.parentElement.parentElement.firstChild);	
		console.log(localStorage.getItem('tasks'));
	}
}

function doneTask(e) {
	if(e.target.parentElement.classList.contains('check-item')) {
		console.log(e.target.parentElement.parentElement.firstChild);
		e.target.parentElement.parentElement.remove();
		removeTaskFromLs(e.target.parentElement.parentElement.firstChild);
	}
}

function removeTaskFromLs(taskItem) {
	let tasks;

	if(localStorage.getItem('tasks') === null) {
		tasks = [];
	} else {
		tasks = JSON.parse(localStorage.getItem('tasks'));
	}
	tasks.forEach(function (task, index) {
		if(taskItem.textContent === task) {
			tasks.splice(index, 1);
		}
	});

	localStorage.setItem('tasks', JSON.stringify(tasks));
}

function clearTasks() {
	while(taskList.firstChild) {
		taskList.removeChild(taskList.firstChild);
	}

	clearLs();
}

function clearLs() {
	localStorage.clear();
}

function filterTasks(e) {
	const filterText = e.target.value.toLowerCase();

	document.querySelectorAll('.collection__item').forEach
	(function(task) {
		const filteredTask = task.firstChild.textContent;
		if(filteredTask.toLowerCase().indexOf(filterText) !== -1) {
			task.style.display = 'block';
		} else {
			task.style.display = 'none';
		}
	});
}