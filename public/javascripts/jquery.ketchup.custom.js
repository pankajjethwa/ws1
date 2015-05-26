jQuery.ketchup

    .helper('isHidden', function(el) {
        return el.is(':hidden');
    })

    .helper('isDisabled', function(el) {
        return el.is(':disabled');
    })
    
    .helper('isBlank', function(value) {
        return (value == null || value.length == 0);
    })

    .helper('isNumber', function(value) {
        return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
    })

    .helper('isDate', function(value) {
        try {
            $.datepicker.parseDate('dd/mm/yy', value);
            return value.length == 10;
        } catch (err) {
            return false;
        }
    })

    .helper('isEmail', function(value) {
        return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
    })
    
    .validation('required', 'Required', function(form, el, value) {
        var type = el.attr('type');
  
        if (this.isHidden(el) || this.isDisabled(el)) {
            return true;
        } else if (type == 'checkbox' || type == 'radio') {
            return el.attr('checked');
        } else {
            return value.length != 0;
        }
    })

    .validation('numeric', 'Invalid number', function(form, el, value) {
        return this.isHidden(el) || this.isDisabled(el) || this.isBlank(value) || this.isNumber(value);
    })

    .validation('date', 'Invalid date', function(form, el, value) {
        return this.isHidden(el) || this.isDisabled(el) || this.isBlank(value) || this.isDate(value);
    })
    
    .validation('email', 'Invalid email', function(form, el, value) {
        return this.isHidden(el) || this.isDisabled(el) || this.isBlank(value) || this.isEmail(value);
    });