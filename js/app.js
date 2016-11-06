'use strict';

var View = {
	/* Caching static dom selectors */
	selectors: {
		$taskBox: document.querySelector('#taskBox'),
		$addTask: document.querySelector('#addTask'),
		$taskList : document.querySelector('.TaskList'),
		$selectBox : document.querySelector('#list-filter')
	},
	
	/**
	 * Method to fetch and populate TaskTpl template with provided task information. This method 
	 * return the html string which is ready to render.
	 * @param data object
	 * @return string
	 */
	getTodoBoxTemplate: function(data) {
		var html = document.getElementById('TaskTpl').innerHTML;
			html = html.replace(/\{name\}/g, data.task);
			html = html.replace(/\{id\}/g, data.id);
			
		html = 	(data.finished) ? 
				html.replace(/\{className\}/g, 'Task--finished') : 
				html.replace(/\{className\}/g, '');
			
		return html;
	},
	
	/**
	 * Method to render the task list. this method convert the array of task 
	 * object to html string and append to the list  
	 * @param tasks array
	 */
	renderTaskList: function(tasks) {
		var html = '';
		
		this.selectors.$taskList.innerHTML = '';
		
		tasks.forEach(function(task) {
			html += this.getTodoBoxTemplate(task);
		}.bind(this));
		
		this.selectors.$taskList.innerHTML = html
		this.bindEventToTaskControlButtons();
	},
	
	/**
	 * Method to bind event handlers for dynamic generated task controls.
	 */
	bindEventToTaskControlButtons: function() {

		var deleteButtons = document.querySelectorAll('.Task__Icon--delete'),
			doneButtons = document.querySelectorAll('.Task__Icon--done'),
			editButtons = document.querySelectorAll('.Task__Icon--edit')
		
		deleteButtons.forEach(function(button) {
			button.addEventListener('click', this.handleRemoveTaskClick.bind(this));
		}.bind(this));
		
		doneButtons.forEach(function(button) {
			button.addEventListener('click', this.handleDoneTaskClick.bind(this));
		}.bind(this));
		
		editButtons.forEach(function(button) {
			button.addEventListener('click', this.handleEditTaskClick.bind(this));
		}.bind(this));
		
	},
	
	/**
	 * Method to add task to model.
	 */
	addTask: function() {
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
	handleAddTaskEnter : function(e)	{
		if(e.keyCode === 13){
			this.addTask();
		}
	},
	
	/**
	 * Method to handle done task click 
	 * @param e object
	 */
	handleDoneTaskClick: function(e)	{
		var id = e.target.getAttribute('data-id');
		Model.finishTask(id);
		this.renderTaskList(Model.fetchTask(Model.filterHandle));
	},
	
	/**
	 * Method to handle remove task click 
	 * @param e object
	 */
	handleRemoveTaskClick : function(e)	{
		var id = e.target.getAttribute('data-id');
		Model.removeTask(id);
		this.renderTaskList(Model.fetchTask(Model.filterHandle));
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
	handleUpdateTaskClick : function(id)	{
		var updateTask = document.getElementById(id + '_todo-edit-box').value;
		Model.updateTask(id, updateTask);
		this.renderTaskList(Model.fetchTask(Model.filterHandle));
	},
	/**
	* Method to handle SelectBox value changes.
	* @param value string
	**/
	handleSelectBoxChange : function(value)	{
		Model.filterHandle = value;
		this.renderTaskList(Model.fetchTask(Model.filterHandle));
	},
		
	/**
	 * Method to toggle task wrappers on edit
	 * @param id string
	 * @param hide boolean
	 */
	toggleTaskWrapper : function(id, hide)	{
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

		var data = [
			{
				value: '0',
				name: 'All Tasks'
			}, {
				value: '1',
				name: 'Pending Tasks'
			}, {
				value: '2',
				name: 'Completed Tasks'
			}
		];

		/** Initializing the select box **/
		var selectBox = new SelectBox(
			this.selectors.$selectBox, 
			data, 
			0,
			this.handleSelectBoxChange.bind(this)
		);
	}
};
/**
* Select Box Module
* @param target DOMObject
* @param data
* @param selected
* @return {SelectBox}
* @constructor
**/
var SelectBox = function (target, data, selected, onChangeHandle) {
	this.target = target;
	this.data = data;
	this.selectors = {};
	this.selected = selected;
	this.onChangeHandle = onChangeHandle;

	/**
	* Method to get the HTML string for the select box
	* 
	**/
	function getSelectBoxTpl()	{
		var selectBoxHtml = document.getElementById('SelectBoxTpl').innerHTML,
				selectBoxListItemHtml = document.getElementById('SelectBoxListItemTpl').innerHTML,
				listItem = '';

		this.data.forEach(function(item)	{
				listItem += selectBoxListItemHtml.replace('{value}', item.value).replace('{name}', item.name);
		}, this);
		
		var data = this.data.find(function(datum){
			return datum.value == this.selected;
		}, this);

		return selectBoxHtml.replace('{listItem}', listItem).replace('{selectedName}', data.name);
	}

	/**
	* Method to render the select box to the provided target
	**/
	function renderSelectBox(){
		this.target.innerHTML = getSelectBoxTpl.call(this);
	}

	/**
	* Method to toggle select box list
	* @param hide boolean
	**/
	function toggleSelectBoxList(hide)	{
		var selectList = this.selectors.$selectList;
		
		if(hide){
			selectList.classList.add('hide');
		}else{
			selectList.classList.remove('hide');
		}
	}

	/**
	* Method to add/remove selection style to select box list item
	**/
	function modifyListItemSelection()	{
		var value = '';
		this.selectors.$selectListItem.forEach(function(item){
			value = item.getAttribute('data-value');

			if(this.selected === value){
				item.classList.add('SelectBox__ListItem--selected');
			}else{
				item.classList.remove('SelectBox__ListItem--selected');
			}
		}, this);
	}

	/**
	* Method to handle the select box item select. Similar to on change event of 
	* select control. In this method we call the onChange event handle that we
	* passed during intialization.
	* module
	* @param e obj
	**/
	function handleSelectBoxClick(e) {
		var eventTarget =e.target,
				value = eventTarget.getAttribute('data-value'),
				hide = false;

		if (value)	{
			hide = true;
			this.selected = value;
			modifyListItemSelection.call(this);
			var data = this.data.find(function(datum){
				return datum.value == value;
			});
			this.selectors.$selectText.innerHTML = data.name;
			this.onChangeHandle(this.selected);
		} else if (
			eventTarget === this.selectors.$selectBox || 
			eventTarget === this.selectors.$selectText || 
			eventTarget === this.selectors.$selectIcon
		)	{
			hide = false;
		} else {
			hide = true;
		}		

		toggleSelectBoxList.call(this, hide);			
	}
	/**
	*Method to cache all selectors.
	**/
	function cacheSelectors()	{
		this.selectors.$selectBox = this.target.querySelector('.SelectBox');
		this.selectors.$selectText = this.target.querySelector('.SelectBox__Text');
		this.selectors.$selectIcon = this.target.querySelector('.SelectBox__Icon');
		this.selectors.$selectList = this.target.querySelector('.SelectBox__List');
		this.selectors.$selectListItem = this.target.querySelectorAll('.SelectBox__ListItem');
	}
	/**
	* Method to load all event bindgs for static DOM elements
	**/
	function loadEventBindings() {
		document.body.addEventListener('click', handleSelectBoxClick.bind(this));
	}

	renderSelectBox.call(this);
	cacheSelectors.call(this);
	loadEventBindings.call(this);

	return this;
};




/* Data Model to handle localstorage and application data */
var Model = {
	
	data : [],
	filterHandle : '0',
	
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
	 * Method to fetch all task from the localstorage and filter based on parameters
	 * @param value string
	 * @return array
	 */
	fetchTask : function(value){
		var todoList = localStorage.getItem('task');

		this.data = (todoList) ? JSON.parse(todoList) : [];
		
		if(value && value == '1'){
			return this.data.filter(function(item){ 
				return !item.finished; 
			});
		}else if(value == '2'){
			return this.data.filter(function(item){
				return item.finished;
			});
		}else{
			return this.data;
		}
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