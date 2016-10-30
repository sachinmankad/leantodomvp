'use strict';

var View = {
	
	/* Caching static dom selectors */
	selectors:	{
		$taskBox: document.querySelector('#taskBox'),
		$addTask: document.querySelector('#addTask'),
		$taskList : document.querySelector('.TaskList')
	},
	
	/**
	 * Method to fetch and populate TaskTpl template with provided task information. This method 
	 * return the html string which is ready to render.
	 * @param data object
	 * @return string
	 */
	getTodoBoxTemplate: function(data)	{
		var html = document.getElementById('TaskTpl').innerHTML;
			html = html.replace(/\{name\}/g, data.task);
			html = html.replace(/\{id\}/g, data.id);
			
		html = (data.finished) ? html.replace(/\{className\}/g, 'Task--finished') : html.replace(/\{className\}/g, '');
			
		return html;
	},
	
	/**
	 * Method to render the task list. this method convert the array of task 
	 * object to html string and append to the list  
	 * @param tasks array
	 */
	renderTaskList: function(tasks)	{
		var html = '';
		
		this.selectors.$taskList.innerHTML = '';
		
		tasks.forEach(function(task)	{
			html += this.getTodoBoxTemplate(task);
		}.bind(this));
		
		this.selectors.$taskList.innerHTML = html
		this.bindEventToTaskControlButtons();
	},
	
	/**
	 * Method to bind event handlers for dynamic generated task controls.
	 */
	bindEventToTaskControlButtons: function()	{
		var deleteButtons = document.querySelectorAll('.Task__Icon--delete'),
			doneButtons = document.querySelectorAll('.Task__Icon--done'),
			editButtons = document.querySelectorAll('.Task__Icon--edit')
		
		deleteButtons.forEach(function(button)	{
			button.addEventListener('click', this.handleRemoveTaskClick.bind(this));
		}.bind(this));
		
		doneButtons.forEach(function(button){
			button.addEventListener('click', this.handleDoneTaskClick.bind(this));
		}.bind(this));
		
		editButtons.forEach(function(button){
			button.addEventListener('click', this.handleEditTaskClick.bind(this));
		}.bind(this));
		
	},
	
	/**
	 * Method to add task to model.
	 */
	addTask: function()	{
		var task = this.selectors.$taskBox.value.trim();
		if(task.length > 0){
			Model.addTask(task);
			this.renderTaskList(Model.fetchTask());
			this.selectors.$taskBox.value = '';	
		}
	},
	
	/**
	 * Method to handle add task click 
	 * @param e object
	 */
	handleAddTaskClick: function(e)	{
		this.addTask();
	},
	
	/**
	 * Method to handle add task on enter 
	 * @param e object
	 */
	handleAddTaskEnter : function(e){
		if(e.keyCode === 13){
			this.addTask();
		}
	},
	
	/**
	 * Method to handle done task click 
	 * @param e object
	 */
	handleDoneTaskClick: function(e){
		var id = e.target.getAttribute('data-id');
		Model.finishTask(id);
		this.renderTaskList(Model.fetchTask());
	},
	
	/**
	 * Method to handle remove task click 
	 * @param e object
	 */
	handleRemoveTaskClick : function(e)	{
		var id = e.target.getAttribute('data-id');
		Model.removeTask(id);
		this.renderTaskList(Model.fetchTask());
	},
	
	/**
	 * Method to handle edit task click 
	 * @param e object
	 */
	handleEditTaskClick : function(e)	{
		var id = e.target.getAttribute('data-id'),
			task = Model.getTaskById(id);
		
		this.toggleTaskWrapper(id, true);
		document.getElementById(id + '_todo-save-btn')
				.addEventListener('click', function(e)	{
					this.handleUpdateTaskClick(id);
				}.bind(this));
	},
	
	/**
	 * Method to handle update task click 
	 * @param e object
	 */
	handleUpdateTaskClick : function(id){
		var updateTask = document.getElementById(id + '_todo-edit-box').value;
		Model.updateTask(id, updateTask);
		this.renderTaskList(Model.fetchTask());
	},
		
	/**
	 * Method to toggle task wrappers on edit
	 * @param id string
	 * @param hide boolean
	 */
	toggleTaskWrapper : function(id, hide){
		var controlWrapper = document.getElementById(id+'_task-control-wrapper'),
			editWrapper = document.getElementById(id+'_task-edit-wrapper');
			
		if(hide){
			controlWrapper.classList.add('hide');
			editWrapper.classList.remove('hide');
		}else{
			controlWrapper.classList.remove('hide');
			editWrapper.classList.add('hide');
		}
	},
	
	/**
	 * Method to load all event bindings for static dom elements
	 */
	loadEventBindings : function(){
		this.selectors.$addTask.addEventListener('click', this.handleAddTaskClick.bind(this));
		this.selectors.$taskBox.addEventListener('keypress', this.handleAddTaskEnter.bind(this));
	},
	
	/**
	 * Method to initialize the view
	 */
	init: function()	{
		this.loadEventBindings();
		this.renderTaskList(Model.fetchTask());
	}
};


/* Data Model to handle localstorage and application data */
var Model = {
	
	data : [],
	
	/**
	 * Method to generate a random unique id
	 * @private
	 * @return string
	 */
	_getId: function () {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},
	
	/**
	 * Method to get the task index from the task collection by id
	 * @param id string
	 * @return array
	 */
	getTaskIndexById: function(id)	{
		return this.data.map(function(item) { return item.id; } ).indexOf(id);
	},
	
	/**
	 * Method to get the task from localstorage by id
	 * @param id string
	 * @return object
	 */
	getTaskById: function(id)	{
		var index = this.getTaskIndexById(id);
		return this.data[index];
	},
	
	/**
	 * Method to add task to localstorage
	 * @param task object
	 */
	addTask: function(task)	{
		this.data.unshift({
			'id' : this._getId(),
			'task' : task,
			'finished' : false, 
		});
		
		localStorage.setItem('task', JSON.stringify(this.data));
	},
	
	/**
	 * Method to update the finished status of the task on localstorage
	 * @param id string
	 */
	finishTask: function(id){
		var index = this.data.map(function(item) { return item.id; } ).indexOf(id);
		this.data[index].finished = !this.data[index].finished;
		localStorage.setItem('task', JSON.stringify(this.data));
	},
	
	/**
	 * Method to fetch all task from the localstorage
	 * @return array
	 */
	fetchTask : function(){
		var todoList = localStorage.getItem('task');
		this.data = (todoList) ? JSON.parse(todoList) : [];
		return this.data;
	},
	
	/**
	 * Method to remove the task from the localstorage
	 * @param id string
	 */
	removeTask : function(id){
		var index = this.getTaskIndexById(id);
		this.data.splice(index, 1);
		localStorage.setItem('task', JSON.stringify(this.data));
	},
	
	/**
	 * Method to update the task name on the localstorage
	 * @param id string
	 * @param task string
	 */
	updateTask : function(id, task){
		var index = this.getTaskIndexById(id);
		this.data[index].task = task;
		localStorage.setItem('task', JSON.stringify(this.data));
	}
};

/* Loading the app on document render ready */
window.onload = function()	{
	View.init();
}