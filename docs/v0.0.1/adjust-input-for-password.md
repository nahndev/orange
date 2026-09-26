# Adjust input for password

## Currently

Ở trang login (`apps/frontend/src/app/(auth)/login/page.tsx`), input password đang dùng `<Input type="password">` của shadcn/ui, luôn ở trạng thái ẩn ký tự, không có nút hiện/ẩn mật khẩu (không icon eye/eye-off), và không có validate phía client ngoài thuộc tính `required` mặc định của HTML.

## Acceptance Criteria

- [ ] Input with hidden/show button
- [ ] When first focus, select all

## Solutions

- [ ] Create share component
- [ ] search all type="password"
- [ ] Using new component
