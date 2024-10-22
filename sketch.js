let bola;
let raqueteJogador;
let raqueteComputador;
let velocidadeBola = 5;
let direcaoBolaX;
let direcaoBolaY;
let alvoComputadorY;
let moverParaBola = false;
let imagemFundo;

const ESPESSURA_BARRA = 5;
const MARGEM = 2;

function setup() {
  createCanvas(800, 400);
  imagemFundo = loadImage("./assets/fundo1.png"); // Carrega a imagem de fundo
  resetarBola();
  raqueteJogador = new Raquete(30);
  raqueteComputador = new Raquete(width - 40);
}

function draw() {
  let imgLargura = imagemFundo.width;  // Largura da imagem
  let imgAltura = imagemFundo.height;  // Altura da imagem
  
  // Cálculo do recorte central da imagem
  let recorteLargura = imgLargura;  // Mantém a largura da imagem
  let recorteAltura = imgAltura * (height / width);  // Proporcional ao tamanho do canvas
  
  let xRecorte = (imgLargura - recorteLargura) / 2;  // Centraliza horizontalmente
  let yRecorte = (imgAltura - recorteAltura) / 2;    // Centraliza verticalmente

  // Desenha apenas o centro da imagem no canvas sem distorção
  image(imagemFundo, 0, 0, width, height, xRecorte, yRecorte, recorteLargura, recorteAltura);

  // Desenha as barras superiores e inferiores
  fill("#2B3FD6");
  noStroke();
  rect(0, 0, width, ESPESSURA_BARRA); // Barra superior
  rect(0, height - ESPESSURA_BARRA, width, ESPESSURA_BARRA); // Barra inferior

  // Desenha a bola
  bola.mostrar();
  bola.mover();
  bola.checarColisao(raqueteJogador);
  bola.checarColisao(raqueteComputador);

  // Desenha e move a raquete do jogador com o mouse
  raqueteJogador.mostrar();
  raqueteJogador.moverComMouse();

  // Desenha a raquete do computador e move-a
  raqueteComputador.mostrar();
  moverComputador();

  // Checa se houve gol
  if (bola.saiuDeBounds()) {
    resetarBola();
  }
}

function resetarBola() {
  bola = new Bola();
  direcaoBolaX = random([-1, 1]);
  direcaoBolaY = random([0, 0]);
  bola.definirDirecao(direcaoBolaX, direcaoBolaY);
  moverParaBola = false; // Reseta a lógica de movimento do computador
}

function moverComputador() {
  // Se a bola foi rebatida, o computador se move em direção à sua trajetória
  if (moverParaBola) {
    raqueteComputador.y += (bola.y - raqueteComputador.y + bola.ySpeed * 5) * 0.1; // Move lentamente em direção à bola
  } else if (bola.x > width / 2 && random() < 0.02) {
    // Caso contrário, escolhe uma nova posição aleatória
    alvoComputadorY = random(height);
    moverParaBola = true; // Ativa a lógica de movimento em direção à bola
  }

  // Limita o movimento da raquete dentro da tela
  raqueteComputador.y = constrain(raqueteComputador.y, ESPESSURA_BARRA + MARGEM, height - raqueteComputador.h - ESPESSURA_BARRA - MARGEM);
}

class Bola {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.size = 20;
    this.velocidade = velocidadeBola;
  }

  definirDirecao(x, y) {
    this.xSpeed = this.velocidade * x;
    this.ySpeed = this.velocidade * y;
  }

  mostrar() {
    fill(255);
    ellipse(this.x, this.y, this.size);
  }

  mover() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Rebater nas barras superior e inferior
    if (this.y < ESPESSURA_BARRA + MARGEM || this.y > height - ESPESSURA_BARRA - MARGEM) {
      this.ySpeed *= -1;
    }
  }

  checarColisao(raquete) {
    if (this.x - this.size / 2 < raquete.x + raquete.w &&
        this.x + this.size / 2 > raquete.x &&
        this.y > raquete.y &&
        this.y < raquete.y + raquete.h) {
      this.xSpeed *= -1;
      // Calcular a posição relativa da colisão na raquete
      let posicaoColisao = (this.y - raquete.y) / raquete.h; // Posição relativa (0 a 1)

      // Mapeia a posição da colisão para um ângulo
      let angulo = map(posicaoColisao, 0, 1, -PI / 4, PI / 4); // Mapeia para ângulos entre -45 e 45 graus

      this.xSpeed = this.velocidade * (this.xSpeed > 0 ? 1 : -1); // Mantém a velocidade na direção X
      this.ySpeed = this.velocidade * sin(angulo); // Atualiza a velocidade na direção Y
      this.aumentarVelocidade(); // Aumenta a velocidade da bola ao colidir
      moverParaBola = true; // Ativa a lógica de movimento em direção à bola ao rebater
    }
  }

  aumentarVelocidade() {
    this.velocidade *= 1.1; // Aumenta a velocidade em 10%
    this.xSpeed = this.velocidade * (this.xSpeed > 0 ? 1 : -1); // Atualiza a direção da velocidade X
    this.ySpeed = this.velocidade * (this.ySpeed > 0 ? 1 : -1); // Atualiza a direção da velocidade Y
  }

  saiuDeBounds() {
    return this.x < 0 || this.x > width;
  }
}

class Raquete {
  constructor(x) {
    this.x = x;
    this.y = height / 2 - 50;
    this.w = 10;
    this.h = 100;
  }

  mostrar() {
    fill(255);
    rect(this.x, this.y, this.w, this.h);
  }

  moverComMouse() {
    // A raquete do jogador segue a posição do mouse no eixo Y
    this.y = mouseY - this.h / 2;
    
    // Limita o movimento da raquete dentro dos limites da tela
    this.y = constrain(this.y, ESPESSURA_BARRA + MARGEM, height - this.h - ESPESSURA_BARRA - MARGEM);
  }
}
