function showReg28ConfirmBox() {
	var res=confirm('Are you sure you want to cancel the scheduled Reg28 job ?');
	if(res == false){
		return false;
	}

	return true;
}

function clearLocalStorage() {
        localStorage.clear();
    }

//var i, checkboxes = document.getElementsByName('TlocIDs');
var i, checkboxes = document.getElementsByName(window.elementId);

function checkAll(source) {
    //checkboxes = document.getElementsByName('TlocIDs');
    checkboxes = document.getElementsByName(elementId);
    for(i=0, n=checkboxes.length;i<n;i++) {
        checkboxes[i].checked = source.checked;
        localStorage.setItem(checkboxes[i].value, checkboxes[i].checked);
    }
}

function save() {
    for (i = 0; i < checkboxes.length; i++) {
        localStorage.setItem(checkboxes[i].value, checkboxes[i].checked);
    }
}

function load () {
    for (i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            localStorage.setItem(checkboxes[i].value, true);
        }
        else
            checkboxes[i].checked = localStorage.getItem(checkboxes[i].value) === 'true' ? true:false;
    }
}

window.onload= load();