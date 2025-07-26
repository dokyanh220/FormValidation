function Validator(formSelector, option = {}) {
    var _this = this
    var formRules = {}

    function getParent (element, selector) {

        while (element.parentElement) {
            if (element.parentElement.matches(selector)){
                return element.parentElement
            }

            element = element.parentElement
        }

    }

    function resetForm(){
        var inputs = formElement.querySelectorAll('input');
        var selects = formElement.querySelectorAll('select');
        inputs.forEach(function(input) {
            switch(input.type) {
                case 'checkbox':
                case 'radio':
                    input.checked = false;
                    break;
                case 'file':
                    input.value = null;
                    break;
                default:
                    input.value = '';
            }
        });
        inputs.forEach((input) => {
            handleClearError({target: input})
        })
    }

    /*
    * Quy ước tạo rule:
    * - Nếu có lỗi thì return `errorMessage`
    * - Nếu không có lỗi thì retuen undifined
    */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Mật khẩu tối thiểu ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Mật khẩu tối đa ${max} ký tự`
            }
        }

    }


    // Lấy ra form element trong DOM theo `formSelector`
    const formElement = document.querySelector(formSelector)

    // Chỉ thực hiện khi có formElement
    if (formElement) {
        // Lấy các thẻ input có thuộc tính name và rules
        var inputs = formElement.querySelectorAll('[name][rules]')

        for(var input of inputs){

            // rules là thuộc tính tự định nghĩa nên sử dụng getAttribute
            var  rules = input.getAttribute('rules').split('|')
            for(var rule of rules) {

                var ruleInfo;  // Mục đích sử dụng cho rule `min, max`
                var isRuleHasValue = rule.includes(':') // VD: min:6, tách phần tử bởi dấu `:`

                if(isRuleHasValue){
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0] // Rule là phần tử 0
                }

                var ruleFunc = validatorRules[rule]

                if(isRuleHasValue) {
                    // Lấy value của rule là phần tử 1
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
            
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            
            // Lắng nghe sự kiện để Validate (blur, change, ..)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        // Thực hiện Validate
        function handleValidate (event) {
            var rules = formRules[event.target.name]
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value)

                if(errorMessage) break;
            }

            if(errorMessage) {
                var formGroup = getParent(event.target, '.form-group')
                if (formGroup) {
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formGroup.classList.add('invalid')
                        formMessage.innerText = errorMessage
                    }
                }
            }

            return !errorMessage
        }

        // Xóa lỗi khi người dùng nhập ký tự
        function handleClearError (event) {
            var formGroup = getParent(event.target, '.form-group')
            if (formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')

                if(formMessage) {
                    formMessage.innerText = ''
                }
            }
        }
    }

    formElement.onsubmit = function (event) {
        event.preventDefault()
        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true

        for(var input of inputs){
            if(!handleValidate({target: input})) {
                isValid = false
            }
        }

        if (isValid) {
            
            if (typeof _this.onSubmit === 'function') {

                // Lấy các input không bị disabled
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                // Tạo object chứa giá trị các input
                var formValues = Array.from(enableInputs).reduce(function(values, input) {
                switch(input.type) {
                    case 'radio':
                        var checked = formElement.querySelector('input[name="' + input.name + '"]:checked');
                        values[input.name] = checked ? checked.value : '';
                        break;
                    case 'checkbox':
                        if(!input.matches(':checked')){
                            return values;
                        } 
                        if(!Array.isArray(values[input.name])){
                            values[input.name] = [];
                        } 
                        values[input.name].push(input.value);
                        break;
                    case 'file':
                        values[input.name] = input.files;
                        break;
                    default:
                        values[input.name] = input.value;
                }
                return values;
                }, {})
                    
                _this.onSubmit(formValues)
                resetForm()

            } else {
                formElement.submit()
            }
        }
    }


}