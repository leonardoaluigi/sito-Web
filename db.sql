CREATE DATABASE cinerate_db;

CREATE TABLE film (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titolo VARCHAR(100) NOT NULL,
  anno INT NOT NULL,
  regista VARCHAR(100),
  foto VARCHAR(255),
  evidenza BOOLEAN DEFAULT FALSE,
  descrizione TEXT,
  durata INT NOT NULL
);

create table generi(
    nome varchar(50) PRIMARY KEY
);


CREATE TABLE film_generi (
    id_film INT,
    nome_genere varchar(50),
    FOREIGN KEY (id_film) REFERENCES film(id),
    FOREIGN KEY (nome_genere) REFERENCES generi(nome),
    PRIMARY KEY (id_film, nome_genere)
);


CREATE TABLE utenti(
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  ruolo ENUM('admin', 'basic') DEFAULT 'basic',
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL,
  data_registrazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO utenti(username,password,ruolo,nome,cognome) values ("leonardoAdmin", "admin", "admin", "Leonardo", "Aluigi");



CREATE TABLE recensioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_film INT NOT NULL,
    id_utente INT NOT NULL,
    testo TEXT NOT NULL,
    voto INT CHECK (voto >= 1 AND voto <= 5),
    data_recensione DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_film) REFERENCES film(id),
    FOREIGN KEY (id_utente) REFERENCES utenti(id)
);


CREATE TABLE contatti(
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  oggetto VARCHAR(255) NOT NULL,
  messaggio TEXT NOT NULL
);







