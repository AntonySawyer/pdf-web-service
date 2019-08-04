# Тестовое задание 
_(node.js, база данных mysql)_
1. таблица user - поля: (firstName, lastName, image(binary), pdf(binary))
2. сделать веб сервис в который подается firstName
3. далее функция находит пользователя в базе по firstName
4. генерит pdf файл вида firstName + lastName + image
5. сохраняет pdf файл в поле pdf базы данных- возвращает пользователю результат в виде JSON (true/false).


Для запуска:
- БД:
```sql 
CREATE DATABASE IF NOT EXISTS `user_pdf` DEFAULT CHARACTER SET utf8;
USE `user_pdf`;
CREATE TABLE IF NOT EXISTS `user_pdf`.`user` 
( `id` INT NOT NULL AUTOINCREMENT,  
`firstName` VARCHAR(32) NOT NULL,  
`lastName` VARCHAR(32) NULL DEFAULT NULL,  
`image` BLOB NULL DEFAULT NULL,  
`pdf` BLOB NULL DEFAULT NULL,
PRIMARY KEY (`id`));
```

- npm i
- npm start
- http://localhost:3000

