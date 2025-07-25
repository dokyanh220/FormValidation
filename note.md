
# Ghi chú & Giải thích chi tiết các hàm, biến trong script.js


## 1. Hàm Validator(options)
### Tham số truyền vào:
- **form**: Chuỗi selector của form cần kiểm tra (ví dụ: '#form-1').
- **formGroupSelector**: Selector của vùng chứa input, giúp xác định vùng hiển thị lỗi (thường là '.form-group').
- **errorSelector**: Selector của vùng hiển thị lỗi (thường là '.form-message').
- **rules**: Mảng các rule kiểm tra, mỗi rule là một object gồm selector và hàm test.
- **onSubmit**: Hàm callback khi submit thành công, nhận vào object chứa dữ liệu form.

### Biến và hàm bên trong:
- **formElement**: Phần tử form lấy theo selector options.form.
- **selectorRule**: Object lưu trữ các hàm kiểm tra cho từng input (theo selector), hỗ trợ nhiều rule cho một input.
- **getParent(element, selector)**: Hàm tìm phần tử cha gần nhất của element theo selector, dùng để xác định vùng hiển thị lỗi cho input.
- **validate(inputElement, rule)**: Hàm kiểm tra 1 input với các rule:
  - Tìm form-group cha của input.
  - Tìm vùng hiển thị lỗi.
  - Lặp qua các rule, kiểm tra giá trị input (đặc biệt xử lý radio/checkbox).
  - Nếu có lỗi: hiển thị message lỗi, thêm class 'invalid'.
  - Nếu hợp lệ: xóa message lỗi, xóa class 'invalid'.
  - Trả về true nếu hợp lệ, false nếu có lỗi.

### Quy trình sự kiện:
- **formElement.onsubmit**: Khi submit form:
  - Lặp qua tất cả các rule, validate từng input.
  - Nếu tất cả hợp lệ, gọi options.onSubmit với dữ liệu form (xử lý đúng radio/checkbox).
  - Nếu có lỗi, hiển thị lỗi cho từng input.
- **inputElement.onblur**: Khi blur khỏi input thì kiểm tra lỗi.
- **inputElement.oninput**: Khi nhập vào input thì xóa lỗi và class 'invalid' ngay, giúp UX tốt hơn.

## 1. Hàm Validator(options)
### Tham số và biến:
- **options**: Object cấu hình gồm các thuộc tính:
  - `form`: selector của form cần validate.
  - `formGroupSelector`: selector của vùng chứa input (thường là `.form-group`).
  - `errorSelector`: selector của vùng hiển thị lỗi (thường là `.form-message`).
  - `rules`: mảng các rule kiểm tra (isRequired, isEmail, ...).
  - `onSubmit`: hàm callback khi submit thành công.
- **formElement**: Phần tử form lấy theo selector options.form.
- **selectorRule**: Object lưu trữ các hàm kiểm tra cho từng input (theo selector).

### Các hàm bên trong:
- **getParent(element, selector)**: Tìm phần tử cha gần nhất của element theo selector (dùng để tìm `.form-group`).
- **validate(inputElement, rule)**: Kiểm tra 1 input với 1 hoặc nhiều rule:
  - Lấy form-group cha của input.
  - Lấy vùng hiển thị lỗi.
  - Lặp qua các rule, kiểm tra giá trị input.
  - Nếu có lỗi: hiển thị message lỗi, thêm class 'invalid'.
  - Nếu hợp lệ: xóa message lỗi, xóa class 'invalid'.
  - Trả về true nếu hợp lệ, false nếu có lỗi.

### Sự kiện:
- **formElement.onsubmit**: Khi submit form:
  - Lặp qua tất cả các rule, validate từng input.
  - Nếu tất cả hợp lệ, gọi options.onSubmit với dữ liệu form.
  - Nếu có lỗi, hiển thị lỗi cho từng input.
- **inputElement.onblur**: Khi blur khỏi input thì kiểm tra lỗi.
- **inputElement.oninput**: Khi nhập vào input thì xóa lỗi và class 'invalid' ngay.

---

## 2. Các rule kiểm tra input
### Nguyên tắc chung:
1. Loại bỏ khoảng trắng với input thường (`trim()`).
2. Nếu có lỗi => trả về message lỗi.
3. Nếu hợp lệ => trả về undefined.

### a. Validator.isRequired(selector)
- Kiểm tra input bắt buộc nhập.
- Nếu là radio/checkbox: kiểm tra có input nào được chọn không (dùng selector + ':checked').
- Nếu là input thường: kiểm tra giá trị có rỗng không (dùng trim).
- Trả về message nếu rỗng hoặc chưa chọn, undefined nếu hợp lệ.

### a. Validator.isRequired(selector)
- Trả về message nếu rỗng hoặc chưa chọn, undefined nếu hợp lệ.

### b. Validator.isEmail(selector)
- Kiểm tra input có đúng định dạng email không (dùng regex chuẩn email).
- Trả về message nếu sai định dạng, undefined nếu hợp lệ.

### b. Validator.isEmail(selector)


### c. Validator.isPassword(selector, min, max)
- Kiểm tra độ dài password trong khoảng min-max ký tự.
- Trả về message nếu không hợp lệ, undefined nếu hợp lệ.
### c. Validator.isPassword(selector, min, max)
- Kiểm tra độ dài password trong khoảng min-max ký tự.

### d. Validator.isConfirmed(selector, getConfirmValue, message)
- Kiểm tra xác nhận (ví dụ: nhập lại mật khẩu).
- `getConfirmValue`: hàm trả về giá trị cần so sánh với input hiện tại.
- `message`: thông báo lỗi nếu không khớp.

## 3. Quy trình hoạt động tổng thể
- Khi submit form, từng input sẽ được validate theo các rule đã khai báo.
- Nếu có lỗi, hiển thị message lỗi và thêm class 'invalid' cho input hoặc nhóm input (radio/checkbox).
- Khi người dùng nhập lại, lỗi sẽ được xóa ngay lập tức và class 'invalid' cũng bị xóa, giúp người dùng biết đã sửa lỗi.
- Nếu tất cả hợp lệ, gọi hàm onSubmit với dữ liệu form (bao gồm xử lý đúng cho radio/checkbox, checkbox trả về mảng value).

---
## 4. Lưu ý đặc biệt
- Với radio/checkbox: luôn validate cả nhóm, không chỉ từng input riêng lẻ.
- Khi lấy dữ liệu submit, radio lấy value của input được chọn, checkbox trả về mảng các value được chọn.
- Hàm getParent giúp xác định đúng vùng hiển thị lỗi cho mọi loại input.

---
Bạn có thể xem lại file script.js để đối chiếu chi tiết từng hàm, biến và quy trình hoạt động.
