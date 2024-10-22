let bola, raqueteJogador, raqueteComputador;
let velocidadeBola = 4;
let direcaoBolaX, direcaoBolaY, alvoComputadorY;
let moverParaBola = false;
let imagemFundo, imgBola, imgBarraJogador, imgBarraComputador;
let bounceSound;  // Variável global para armazenar o som
let victorySound; // Variável global para armazenar o som da vitória
let somAtivado = false;  // Estado do som (ativado/desativado)
const ESPESSURA_BARRA = 5;
const MARGEM = 2;
let jogoPausado = false;  // Variável para controlar o estado do jogo


function setup() {
  createCanvas(800, 400);

  // Carrega o arquivo de som
  bounceSound = loadSound("./assets/bounce.mp3");
  victorySound = loadSound("./assets/victory.mp3");
  
  // Carrega as imagens
  imagemFundo = loadImage("./assets/fundo1.png");
  imgBola = loadImage("./assets/bola.png");
  imgBarraJogador = loadImage("./assets/barra01.png");
  imgBarraComputador = loadImage("./assets/barra02.png");

  resetarBola();
  raqueteJogador = new Raquete(30);
  raqueteComputador = new Raquete(width - 40);

  // Cria um botão para ativar/desativar o som
  let botaoSom = createButton('Ativar Som');
  botaoSom.position(10, 10);  // Define a posição do botão
  botaoSom.mousePressed(toggleSom);  // Define a função a ser chamada ao clicar

  // Cria um botão para pausar o jogo
  let botaoPausa = createButton('Pausar Jogo');
  botaoPausa.position(90, 10); // Define a posição do botão
  botaoPausa.mousePressed(togglePausa); // Define a função a ser chamada ao clicar
}

function toggleSom() {
  if (somAtivado) {
    bounceSound.stop(); // Para o som se estiver tocando
    victorySound.stop(); // Para o som de vitória se estiver tocando
    this.html('Ativar Som'); // Altera o texto do botão
  } else {
    bounceSound.setVolume(1); // Define o volume máximo
    bounceSound.play(); // Reproduz o som (inicializa o AudioContext)
    victorySound.setVolume(1); // Define o volume máximo para o som de vitória
    this.html('Desativar Som'); // Altera o texto do botão
  }
  somAtivado = !somAtivado; // Alterna o estado do som
}

function togglePausa() {
  jogoPausado = !jogoPausado; // Alterna o estado do jogo
  this.html(jogoPausado ? 'Continuar Jogo' : 'Pausar Jogo'); // Altera o texto do botão
}

function draw() {
  if (jogoPausado) {
    return; // Se o jogo estiver pausado, não faz nada
  }

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
    // Toca o som de vitória se o som estiver ativado
    if (somAtivado) {
      victorySound.play();  // Reproduz o som de vitória
    }
    resetarBola();
  }
}

function resetarBola() {
  bola = new Bola();
  direcaoBolaX = random([-1, 1]);
  direcaoBolaY = random([0, 0]);
  bola.definirDirecao(direcaoBolaX, direcaoBolaY);
  moverParaBola = false; // Reseta a lógica de movimento do computador
  bola.anguloRotacao = 0;
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
    this.size = 30;
    this.velocidade = velocidadeBola;
    this.anguloRotacao = 0;  // ângulo de rotação inicial
  }

  // Definir a rotação com base na velocidade da bola
  atualizarRotacao() {
    let velocidadeTotal = sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
    this.anguloRotacao += velocidadeTotal * 0.05;  // Ajuste da velocidade de rotação
  }

  definirDirecao(x, y) {
    this.xSpeed = this.velocidade * x;
    this.ySpeed = this.velocidade * y;
  }

  mostrar() {
    let tamanhoEscalado = this.size * 0.5;  // Escala para metade

    // Atualiza a rotação com base na velocidade
    this.atualizarRotacao();

    // Centraliza o ponto de rotação e desenha a bola rotacionada
    push();
    translate(this.x, this.y);  // Translada para a posição da bola
    rotate(this.anguloRotacao); // Aplica a rotação com base no ângulo
    imageMode(CENTER);          // Define o modo de desenho com a imagem centralizada
    image(imgBola, 0, 0, tamanhoEscalado, tamanhoEscalado);  // Desenha a bola rotacionada
    pop();
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

      // Toca o som ao colidir com uma raquete se o som estiver ativado
      if (somAtivado) {
        if (bounceSound.isPlaying()) {
          bounceSound.stop();  // Para o som se já estiver tocando
        }
        bounceSound.play();  // Reproduz o som
      }

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
    this.w = 15;
    this.h = 100;
  }

  mostrar() {
    let alturaEscalada = this.h * 0.5;  // Escala para metade
    let larguraEscalada = this.w * 0.5;  // Escala para metade

    if (this.x < width / 2) {
      // Desenha a barra do jogador
      image(imgBarraJogador, this.x, this.y, larguraEscalada * 2, alturaEscalada * 2);  // Escala de volta para largura completa
    } else {
      // Desenha a barra do computador
      image(imgBarraComputador, this.x, this.y, larguraEscalada * 2, alturaEscalada * 2);  // Escala de volta para largura completa
    }
  }

  moverComMouse() {
    // A raquete do jogador segue a posição do mouse no eixo Y
    this.y = mouseY - this.h / 2;
    
    // Limita o movimento da raquete dentro dos limites da tela
    this.y = constrain(this.y, ESPESSURA_BARRA + MARGEM, height - this.h - ESPESSURA_BARRA - MARGEM);
  }
}
