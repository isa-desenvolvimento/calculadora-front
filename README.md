<h1 align="center">
   <img src="http://img.shields.io/static/v1?label=STATUS&message=CONCLUIDO&color=GREEN&style=for-the-badge"/>
Calculadora Jurídica - Front End
</h1>


### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com/), [Node.js - v10.24.1](https://nodejs.org/en/)
Além disto é bom ter um editor para trabalhar com o código como [VSCode](https://code.visualstudio.com/)


### 🎲 Rodando o Front


```
git clone https://juliano_sts@bitbucket.org/juliano_sts/calculadora-front.git
```
```
cd calcadora-front
```

```
git checkout release_v2
```

```
npm install
```

```
npm install -g @angular/cli

```

### Altere nos arquivos Enviroment (environment.ts - environment.prod.ts) o caminho que o back está rodando
ex.: 

```
export const environment = {
  production: true,
  AUTH_PATH: 'https://localhost:5001/auth',
  API_PATH: 'https://localhost:5001/api'
};
```

```
npm build && npm start

```

** No terminal deve aparecer o projeto rodando http://localhost:4200 
