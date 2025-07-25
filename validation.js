// Hàm khởi tạo Validator để validate form theo các rules truyền vào
// options: {
//   form: selector của form,
//   errorSelector: selector của vùng hiển thị lỗi,
//   rules: mảng các rule kiểm tra,
//   onSubmit: hàm callback khi submit thành công
// }
function Validator(options) {
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
        selects.forEach(function(select) {
            select.selectedIndex = 0;
        });
        var errorElements = formElement.querySelectorAll(options.errorSelector);
        errorElements.forEach(function(error) {
            error.innerText = '';
        });
        var formGroups = formElement.querySelectorAll(options.formGroupSelector);
        formGroups.forEach(function(group) {
            group.classList.remove('invalid');
        });
    }
    // Lấy element cha của input theo selector
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    // Lưu trữ các rule cho từng selector input
    var selectorRule = {}

    function validate(inputElement, rule) {
        // Lấy vùng hiển thị lỗi
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;
        // Lấy tất cả các rule của input này
        var rules = selectorRule[rule.selector];
        // Kiểm tra lần lượt các rule, gặp lỗi thì dừng
        for(let i = 0; i < rules.length; i++){
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    var checkedInput = formElement.querySelector(rule.selector + ':checked');
                    errorMessage = rules[i](
                        checkedInput ? checkedInput.value : '',
                        inputElement
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value, inputElement);
            }
            if(errorMessage) break
        }
        // Hiển thị lỗi hoặc xóa lỗi
        if(errorElement) {
            if(errorMessage) {
                errorElement.innerText = errorMessage
                getParent(inputElement, options.formGroupSelector).classList.add('invalid');    
            } else {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
            }
        }
        return !errorMessage
    }


    // Lấy element form cần validate
    var formElement = document.querySelector(options.form);
    
    if(formElement) {
        // Bắt sự kiện submit form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true

            // Lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })

            // Nếu form hợp lệ thì xử lý submit
            if(isFormValid) {
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function') {
                    // Lấy tất cả input có name và không bị disable
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
                                    values[input.name] = '';
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
                    
                    options.onSubmit(formValues)
                    resetForm();
                } 
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit()
                }
            }
        }

        // Xử lý từng rule (lắng nghe blur, input,...)
        options.rules.forEach((rule) => {
            // Lưu các hàm kiểm tra cho mỗi input (theo selector)
            if(Array.isArray(selectorRule[rule.selector])){
                selectorRule[rule.selector].push(rule.test)
            } else {
                selectorRule[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement) {
                // Khi blur khỏi input thì kiểm tra
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                // Khi user nhập vào input thì xóa lỗi ngay
                inputElement.oninput = function() {
                    var formGroup = getParent(inputElement, options.formGroupSelector);
                    var errorElement = formGroup.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    formGroup.classList.remove('invalid');
                }
            });
        });
    }
}


// Các rule kiểm tra input:
// 1. Loại bỏ khoảng trắng `trim()`
// 2. Nếu có lỗi => trả về message lỗi
// 3. Nếu hợp lệ => trả về undefined

// Rule kiểm tra bắt buộc nhập
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function  (value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này';
        }
    };
}


// Rule kiểm tra định dạng email
Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function  (value) {
           var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
           return regex.test(value) ? undefined : 'Vui lòng nhập email'
        }
    };
}


// Rule kiểm tra độ dài password
Validator.isPassword = function (selector, min, max) {
    return {
        selector: selector,
        test: function  (value) {
           return value.length >= min && value.length <= max ? undefined : `Vui lòng nhập từ mật khẩu ${min} - ${max} ký tự`
        }
    };
}


// Rule kiểm tra xác nhận (ví dụ: nhập lại mật khẩu)
// getConfirmValue: hàm trả về giá trị cần so sánh
// message: thông báo lỗi nếu không khớp
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị không khớp'
        }
    }
}