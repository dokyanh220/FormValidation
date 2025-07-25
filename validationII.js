function Validator(formSelector) {
    var formRules = {}

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

    var ruleName


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

                var ruleInfo;
                var isRuleHasValue = rule.includes(':')

                if(isRuleHasValue){
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
            
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            
        }
        console.log(formRules)


    }
}