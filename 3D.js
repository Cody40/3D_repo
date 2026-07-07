const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

xcen = canvas.width/2;
ycen = canvas.height/2;
ma = 200;
camz = -50;
//화면 크기와 camz로 fov 구하고 쓸 수 있음

prevX = 0;
prevY = 0;
drag = 0;
curX = 0;
curY = 0;

Yrot = 0;
Xrot = 0;
Yrotsum = 0;
Xrotsum = 0;

color = "rgb(252 182 231 / 255%)";

dots = [
[10,20,10],
[-10,20,10],
[-10,-10,10],
[10,-10,10],
[10,20,-10],
[-10,20,-10],
[-20,-10,-10],
[10,-10,-10]];

findots = JSON.parse(JSON.stringify(dots));


function triangle(a,b,c,d,e,f,g) {
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.lineTo(e, f);
    ctx.lineTo(a, b);
    ctx.fill();
    ctx.stroke();
}

function drawtri(a,b,c) {
    AB = [findots[b][0]-findots[a][0], findots[b][1]-findots[a][1],findots[b][2]-findots[a][2]]
    AC = [findots[c][0]-findots[a][0], findots[c][1]-findots[a][1],findots[c][2]-findots[a][2]]
    // AB, AC 리스트는 각각 a->b , a->c인 벡터입니다
    
    cross_prod = [AB[1]*AC[2]-AB[2]*AC[1], AB[2]*AC[0]-AB[0]*AC[2], AB[0]*AC[1]-AB[1]*AC[0]]
    //두 벡터의 외적으로 그 면(삼각형)의 법선벡터를 구하고
    
    magnitude = Math.sqrt(cross_prod[0]*cross_prod[0] + cross_prod[1]*cross_prod[1] + cross_prod[2]*cross_prod[2])
    // magnitude = 법선벡터의 크기
    normal = [cross_prod[0]/magnitude, cross_prod[1]/magnitude, cross_prod[2]/magnitude]
    // 노멀벡터 = 법선벡터를 크기가 1이게 만든, 그러니까 방향값만 갖는 벡터
    
    if (normal[0]*findots[a][0] + normal[1]*findots[a][1] + normal[2]*(findots[a][2]-camz) < 0 &&
        findots[a][2] > camz && findots[b][2] > camz && findots[c][2] > camz) {
        //첫번째 조건: 이 면의 법선벡터와 카메라 벡터의 내적을 구하고 내적이 음수이면 참, 아니면 거짓
        //두번째 조건: 첫번째 조건이 만족되었을 때 면이 카메라 앞에 있는지, 뒤에 있는지 확인
        x1 = xcen + findots[a][0]/(findots[a][2]-camz)*ma;
        y1 = ycen - findots[a][1]/(findots[a][2]-camz)*ma;
        x2 = xcen + findots[b][0]/(findots[b][2]-camz)*ma;
        y2 = ycen - findots[b][1]/(findots[b][2]-camz)*ma;
        x3 = xcen + findots[c][0]/(findots[c][2]-camz)*ma;
        y3 = ycen - findots[c][1]/(findots[c][2]-camz)*ma;
        //3차원 점의 x,y,z를 2차원 화면의 x,y값으로 변환(하고 웹사이트 캔버스에 맞게 크기 조정)
        //이 예제에선 그냥 점의 x,y좌표를 (z좌표-카메라z값)으로 나누기만 하면 됨
        triangle(x1,y1,x2,y2,x3,y3,color);
    }
}
  

function draw() {
    applyRotation();
    if (Xrotsum > Math.PI/2) {
        Xrotsum = Math.PI/2;
        Xrot = 0;
    }
    if (Xrotsum < -Math.PI/2) {
        Xrotsum = -Math.PI/2;
        Xrot = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawtri(0,1,2);
    drawtri(2,3,0);//1
    drawtri(1,5,6);
    drawtri(6,2,1);//2
    drawtri(5,4,7);
    drawtri(7,6,5);//3
    drawtri(4,0,3);
    drawtri(3,7,4);//4
    drawtri(4,5,1);
    drawtri(1,0,4);//5
    drawtri(3,2,6);
    drawtri(6,7,3);//6

    Xrotsum = Xrotsum + Xrot;
    Yrotsum = Yrotsum + Yrot;
    
    requestAnimationFrame(draw);
}

function Mdown() {drag = 2;}

function Mup() {drag = 0;}

function Mmove(event) {
    if (drag == 2) {
        const rect = canvas.getBoundingClientRect();
        prevX = event.clientX - rect.left;
        prevY = event.clientY - rect.top;
        drag = 1;
    } else if (drag == 1) {
        const rect = canvas.getBoundingClientRect();
        curX = event.clientX - rect.left;
        curY = event.clientY - rect.top;
        Yrot = (curX - prevX)*0.012;
        Xrot = (prevY - curY)*0.012;
        prevX = curX;
        prevY = curY;
        if (Xrotsum > Math.PI/2) {
            Xrotsum = Math.PI/2;
            Xrot = 0;
        }
        if (Xrotsum < -Math.PI/2) {
            Xrotsum = -Math.PI/2;
            Xrot = 0;
        }
    }
}

function Mwheel(event) {
    camz += event.deltaY*0.0015*camz
    camz = Math.max(Math.min(camz, 10),-400)
}

function applyRotation() {
    for (let i = 0; i < dots.length; i++) {
        findots[i][0] = dots[i][0];
        findots[i][1] = dots[i][1];
        findots[i][2] = dots[i][2];
        saveX = dots[i][0];
        findots[i][0] = dots[i][0]*Math.cos(Yrotsum)-dots[i][2]*Math.sin(Yrotsum);
        findots[i][2] = saveX*Math.sin(Yrotsum)+dots[i][2]*Math.cos(Yrotsum);
        saveY = findots[i][1]
        findots[i][1] = findots[i][1]*Math.cos(Xrotsum)-findots[i][2]*Math.sin(Xrotsum);
        findots[i][2] = saveY*Math.sin(Xrotsum)+findots[i][2]*Math.cos(Xrotsum);
    }
    Yrot = Yrot*0.8;
    Xrot = Xrot*0.8;
}

canvas.addEventListener('mousedown', Mdown);
canvas.addEventListener('mouseup', Mup)
canvas.addEventListener('mousemove', Mmove);
canvas.addEventListener('wheel', Mwheel);

draw();
