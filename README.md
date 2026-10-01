# Orange - Translation project

## Project là gì

- Đây là thư viên dùng để thao tác với dữ liệu translation i18n
- Cung cấp giao diện và các api cho phép quản lý bộ từ điển, tự động tạo commit, MR.

## Tính năng chính

- Quản lý từ điển
- Quản lý ngôn ngữ
- Tự động dịch thông qua AI
- Tự động commit

## Phân tích tính năng

1. Quản lý từ điển

- Cho phép tạo nhiều bộ từ điển
- Mỗi bộ từ điển gồm key, tên và các ngôn ngữ được cài đặt
- Bộ từ điển gồm bộ mô tả ngữ cảnh và bộ thuật ngữ (các giá trị tương dương trong ngôn ngữ khác + mô tả)
- Mỗi bộ từ điển gồm danh sách các từ gồm key và giá trị cho từng ngôn ngữ
- Khi tạo, người dùng chỉ nhập key, ngôn ngữ, giá trị hệ thống sẽ dùng AI tự điền phần còn lại.
- Sẽ cho phép chỉnh sửa từng trường
- Khi thêm ngôn ngữ, sẽ dùng AI tự bổ sung các trường còn lại.

2. Quản lý ngôn ngữ

- Có danh sách gồm nhiều ngôn ngữ
- Cho phép thêm danh sách ngôn ngữ mới
- Mỗi ngôn ngữ gồm unique key và mô tả

3. Tự động dịch AI

Khi một từ mới với ngôn ngữ góc được thêm vào:

- Bước 1: thuật ngữ -> tìm các từ trong danh sách thuật ngữ, lấy các thuật ngữ giồng các từ trong đoạn.
- Bước 2: Xây dựng hệ thống ranking để tìm kiếm các bộ tự gần giống, lấy danh sách 10 bản dịch gần giống làm context.
- Bước 3: lấy mo tả ngữ cảnh của bộ từ
- Bước 4: Sử lý thông qua AI
- bước 5: Sử lý thông tin trả về từ AI

4. Tự động commit

- Cài đặt gồm thư mục, template tên các file, khi nào commit
- Tính năng được xây dựng độc lập với tính năng của từ điển.
- Tính năng sẽ được xây dựng dưới dạng jobs
- Sử dụng các thư viện để tích hợp cho gitlab, github, ...
- Cấu hình sẽ cho phép commit theo sự kiện: khi chỉnh sửa, khi publish, khi đến thời điểm.

## Thiết kết hệ thống

1. Backend

- Nestjs + Typescript
- Database PostgresSql + Prisma
- Auth basic (email + password)

2. Frontend

- Nextjs + Typescript
- Tailwindcss + shadcn/ui
- Auth: NextAuth
- global state: zustand
- api service: tanstack/query

3. Search engin

- Melisearch
- Install by docker

4. AI

- Ollama
- qwen2.5:7b
- Install by docker
