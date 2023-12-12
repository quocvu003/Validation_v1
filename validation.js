// Đối tượng `Validator`
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
    return null;
  }
  var selectorRules = {};
  // Hàm thực hiện
  function Validate(inputElement, rule) {
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

    var errorMessage;
    // Lấy ra các rules của selector
    var rules = selectorRules[rule.selector];

    // Lặp qua từng rules & kiểm tra
    // Nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
          errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add('invalid');
    } else {
      errorElement.innerText = '';
      getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }
    return !errorMessage;
  }
  // Lấy element của form càn validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi Submit form
    formElement.onsubmit = function (event) {
      event.preventDefault();
      var isFormValid = true;

      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);

        var isValid = Validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        // Trường hợp submit form với JS
        if (typeof options.onSubmit === 'function') {
          var enableInput = formElement.querySelectorAll('[name]:not([disable]');
          var formValue = Array.from(enableInput).reduce(function (values, input) {
            switch (input.type) {
              case 'checkbox':
                // Không checked thì cho value là một mảng
                if (!values[input.name]) values[input.name] = [];
                // Nếu checked thì push vào mảng
                if (input.checked) values[input.name].push(input.value);
                // Kiểm tra nếu là mảng rỗng thì gán là chuỗi ''
                if (values[input.name].length === 0) values[input.name] = '';
                break;

              case 'radio':
                // Chưa tối ưu code
                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          }, {});
          options.onSubmit(formValue);
          // Trường hợp submit form với HTML
        } else {
          formElement.submit();
        }
      }
    };

    // Lặp qua các rule và xử lí
    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          // Xử lý trường hợp blur ra khỏi input
          inputElement.onblur = function () {
            Validate(inputElement, rule);
          };
          // Xử lí mỗi khi người dùng nhập
          inputElement.oninput = function () {
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
          };
        }
      });
    });
  }
}
// Định nghĩa Rules
// Nguyễn tắc của các rules:
// 1. Khi có lỗi => Trả ra messa lỗi
// 2. Khi hợp lệ => undefined
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || 'Vui lòng nhập trường này';
    },
  };
};
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || 'Trường này phải là email';
    },
  };
};
Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};
Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue().value ? undefined : message || 'Giá trị nhập không chính xác';
    },
  };
};
