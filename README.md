# 🚀 Deploy Tutorial — สอน Deploy ตั้งแต่ 0

โปรเจกต์นี้สำหรับ developer ที่ไม่เคย deploy มาก่อน
สอนให้เข้าใจ concept → ลองทำจริงบน Minikube (localhost)

---

## 📋 สารบัญ

1. [ภาพรวม: Deploy ขึ้น Cloud มีอะไรบ้าง](#-ภาพรวม-deploy-ขึ้น-cloud-มีอะไรบ้าง)
2. [แต่ละชิ้นคืออะไร ทำหน้าที่อะไร](#-แต่ละชิ้นคืออะไร-ทำหน้าที่อะไร)
3. [สิ่งที่ต้องติดตั้ง](#-สิ่งที่ต้องติดตั้ง)
4. [Step-by-Step: ลองทำบน Minikube](#-step-by-step-ลองทำบน-minikube)
5. [ใส่ ArgoCD (GitOps)](#-ใส่-argocd-gitops)
6. [Deploy Cloud จริง ต่างจาก Minikube ยังไง](#-deploy-cloud-จริง-ต่างจาก-minikube-ยังไง)

---


## 🗺 ภาพรวม: Deploy ขึ้น Cloud มีอะไรบ้าง

เมื่อ deploy app ขึ้น production จริงๆ จะมี flow แบบนี้:

```
Developer → Git → CI/CD (build image) → Registry → ArgoCD → Kubernetes → Running App
```

แบบละเอียด:

```
┌──────────┐     ┌──────┐     ┌──────────────┐     ┌──────────┐     ┌────────┐     ┌────────────┐     ┌─────────┐
│Developer │────▶│ Git  │────▶│ CI/CD        │────▶│ Registry │────▶│ ArgoCD │────▶│ Kubernetes │────▶│  App    │
│เขียน code │     │เก็บcode│     │build image   │     │เก็บ image │     │GitOps  │     │รัน container│     │ทำงาน!  │
└──────────┘     └──────┘     └──────────────┘     └──────────┘     └────────┘     └────────────┘     └─────────┘
```

**อธิบายแต่ละขั้น:**

| # | ขั้นตอน | ทำอะไร |
|---|---------|--------|
| 1 | Developer เขียน code | เขียน app, แก้ bug, เพิ่ม feature |
| 2 | Push ขึ้น Git | เก็บ code ทั้งหมดใน GitHub/GitLab |
| 3 | CI/CD build image | ระบบอัตโนมัติสร้าง Docker image จาก code |
| 4 | Push ไป Registry | เก็บ image ไว้ให้ Kubernetes มาดึง |
| 5 | ArgoCD ดู Git | เห็น config เปลี่ยน → สั่ง deploy |
| 6 | Kubernetes รัน | ดึง image มารัน, ดูแลให้ไม่ล่ม |
| 7 | App ทำงาน | user เข้าใช้ได้! |

> **ในโปรเจกต์นี้** เราจะลองทำ step 3-7 บน Minikube (K8s บนเครื่องตัวเอง)
> CI/CD จะ build เองด้วยมือก่อน เพื่อให้เข้าใจ concept

---


## 🧩 แต่ละชิ้นคืออะไร ทำหน้าที่อะไร

### 🐳 Docker

**คืออะไร:** เครื่องมือสร้าง "กล่อง" (container) ที่บรรจุ app + dependencies ทั้งหมด

**ทำหน้าที่อะไร:** ทำให้ app รันได้เหมือนกันทุกที่
- เครื่อง dev มี Node 18, server มี Node 20 → ปัญหา!
- ใส่ Docker → ทุกที่ใช้ Node 20 เหมือนกันหมด

**ให้นึกภาพ:** กล่องพัสดุ — ไม่ว่าส่งไปไหน ข้างในเหมือนกัน

---

### 📦 Container Registry

**คืออะไร:** ที่เก็บ Docker image (เหมือน npm registry แต่เก็บ image)

**ทำหน้าที่อะไร:** เป็นคลังเก็บ image → Kubernetes มาดึงไปรัน

**ตัวอย่าง:**
- Docker Hub (ฟรี, public)
- GitHub Container Registry — ghcr.io (ฟรี)
- AWS ECR (ใช้กับ EKS)
- Google GCR (ใช้กับ GKE)

---

### ☸️ Kubernetes (K8s)

**คืออะไร:** ระบบจัดการ container — รัน, ปิด, scale, restart อัตโนมัติ

**ทำหน้าที่อะไร:**
- App crash → restart ให้
- คนเยอะ → scale เพิ่ม pod
- อัปเดต app → ไม่ downtime (rolling update)

**ให้นึกภาพ:** หัวหน้าโรงงาน — ดูว่าคนงาน (container) ทำงานครบ ไม่มีใครหาย

**ศัพท์ที่ต้องรู้:**
- **Pod** = container ที่รันอยู่ 1 ตัว
- **Deployment** = ตัวจัดการ pod (สร้าง, restart, scale)
- **Service** = ทางเข้า pod (IP ถาวร)
- **Namespace** = folder แบ่งกลุ่ม resource

---

### ⎈ Helm

**คืออะไร:** Package manager ของ Kubernetes (เหมือน npm ของ Node.js)

**ทำหน้าที่อะไร:** จัดการ K8s config ให้เป็นระเบียบ
- แทนที่เขียน YAML หลายไฟล์ → เขียน template + values.yaml
- เปลี่ยน config ง่าย (แก้ values.yaml ที่เดียว)
- install / uninstall / upgrade ง่าย

**ให้นึกภาพ:** `npm install express` → Helm ก็เหมือน `helm install my-app`

---

### 🔄 ArgoCD

**คืออะไร:** GitOps tool — ทำให้ Git เป็น "source of truth"

**ทำหน้าที่อะไร:**
- เฝ้าดู Git repo → เห็น config เปลี่ยน → deploy ให้อัตโนมัติ
- ไม่ต้อง `kubectl apply` เอง
- มี UI dashboard ดูสถานะ deploy
- Rollback ง่าย (revert git commit)

**หลักการ GitOps:**
- ทุกอย่างที่รันบน K8s ต้องอยู่ใน Git
- ห้ามแก้ตรงใน K8s → ต้องแก้ใน Git → ArgoCD sync ให้

---


## 🛠 สิ่งที่ต้องติดตั้ง

### macOS (Homebrew)

```bash
# 1. Docker Desktop — สร้าง + รัน container
brew install --cask docker

# 2. Minikube — Kubernetes บนเครื่องตัวเอง (ลองก่อนขึ้น cloud)
brew install minikube

# 3. kubectl — คำสั่งจัดการ Kubernetes
brew install kubectl

# 4. Helm — package manager ของ K8s
brew install helm

# 5. ArgoCD CLI (optional — ไว้จัดการจาก terminal)
brew install argocd
```

### ตรวจสอบว่าติดตั้งสำเร็จ

```bash
docker --version       # Docker version 24.x+
minikube version       # minikube version: v1.x+
kubectl version --client  # Client Version: v1.x+
helm version           # version.BuildInfo{Version:"v3.x+"}
```

---

## 🚀 Step-by-Step: ลองทำบน Minikube

### Step 1: เริ่ม Kubernetes cluster

```bash
# สร้าง cluster บนเครื่อง (ใช้เวลา 1-2 นาที)
minikube start

# ตรวจสอบว่า cluster พร้อม
kubectl get nodes
# ผลลัพธ์ที่ต้องเห็น:
# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   1m    v1.28.x
```

---

### Step 2: ทดลองรัน app บนเครื่องก่อน (optional)

```bash
npm install
npm start

# เปิด browser: http://localhost:3000
# ต้องเห็น: {"message":"Hello World! 🚀","version":"1.0.0"}

# เปิด http://localhost:3000/health
# ต้องเห็น: {"status":"ok"}

# กด Ctrl+C หยุด
```

---

### Step 3: Build Docker image

```bash
# ⚠️ สำคัญมาก! ใช้ Docker ของ Minikube
# (ทำให้ image อยู่ใน Minikube เลย ไม่ต้อง push ไป registry)
eval $(minikube docker-env)

# Build image ชื่อ hello-app
docker build -t hello-app:latest .

# ตรวจสอบว่า image ถูกสร้าง
docker images | grep hello-app
# ผลลัพธ์: hello-app   latest   xxxxx   xx seconds ago   xxx MB
```

> **💡 `eval $(minikube docker-env)` ทำอะไร?**
> สั่งให้ terminal ใช้ Docker engine ของ Minikube แทน Docker Desktop
> image ที่ build จะอยู่ใน Minikube เลย → K8s ดึงไปใช้ได้ทันทีไม่ต้อง push

---

### Step 4: Deploy ด้วย Helm

```bash
# Deploy app ขึ้น Kubernetes!
helm install hello-app ./helm/hello-app

# ดู pod (รอจน STATUS = Running)
kubectl get pods
# ผลลัพธ์: hello-app-hello-app-xxxxx   1/1   Running   0   10s

# ดู service
kubectl get services
# ผลลัพธ์: hello-app-hello-app   NodePort   10.x.x.x   80:3xxxx/TCP
```

---

### Step 5: เปิดดู app ที่ deploy แล้ว

```bash
# เปิด browser อัตโนมัติ ไปที่ app
minikube service hello-app-hello-app

# หรือดูแค่ URL
minikube service hello-app-hello-app --url
# ผลลัพธ์: http://192.168.49.2:30xxx
```

🎉 **เห็น `{"message":"Hello World! 🚀"}` = Deploy สำเร็จ!**

ตอนนี้ app รันอยู่บน Kubernetes แล้ว

---

### Step 6: ลองแก้ code → deploy ใหม่

```bash
# 1. แก้ message ใน index.js เช่น "Hello Kubernetes!"

# 2. Build image ใหม่ (ยังอยู่ใน minikube docker-env)
docker build -t hello-app:latest .

# 3. สั่ง restart pod (ดึง image ใหม่)
kubectl rollout restart deployment/hello-app-hello-app

# 4. รอจน pod ใหม่ Running
kubectl get pods

# 5. เปิดดู
minikube service hello-app-hello-app
# → เห็น message ใหม่!
```

---

### 🧹 เก็บกวาด (ลบทุกอย่าง)

```bash
helm uninstall hello-app    # ลบ app ออกจาก K8s
minikube stop               # หยุด cluster
minikube delete             # ลบ cluster ทิ้ง (ทำเมื่อไม่ใช้แล้ว)
```

---


## 🔄 ใส่ ArgoCD (GitOps)

ถ้าทำ Step 1-5 ข้างบนเสร็จแล้ว → ลองเพิ่ม ArgoCD เพื่อ auto deploy

### Step 1: ติดตั้ง ArgoCD บน Minikube

```bash
# สร้าง namespace
kubectl create namespace argocd

# ติดตั้ง ArgoCD (ดึงจาก internet)
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# รอให้ ArgoCD พร้อม (1-2 นาที)
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
```

### Step 2: เปิด ArgoCD UI

```bash
# Port forward (เปิดทางเข้า ArgoCD UI)
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# เปิด https://localhost:8080 ใน browser
# ⚠️ browser จะเตือน SSL → กด Advanced → Proceed

# ดึง password
# username: admin
# password: (รันคำสั่งนี้)
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

### Step 3: Push code ขึ้น Git repo

ArgoCD ต้องดึง config จาก Git → ต้อง push code ขึ้น GitHub ก่อน

```bash
git init
git add .
git commit -m "deploy tutorial"
git branch -M main
git remote add origin https://github.com/<your-username>/deploy-tutorial.git
git push -u origin main
```

### Step 4: แก้ repoURL + Apply

```bash
# แก้ไฟล์ argocd/application.yaml
# เปลี่ยน <your-username> เป็น GitHub username ของคุณ

# Apply
kubectl apply -f argocd/application.yaml
```

### Step 5: ดูผลใน ArgoCD UI

- เปิด https://localhost:8080
- จะเห็น app "hello-app" กำลัง sync
- status เป็น "Synced" + "Healthy" = สำเร็จ!

### ทดลอง GitOps:

```bash
# 1. แก้ code (เช่น เปลี่ยน replicaCount ใน values.yaml เป็น 2)
# 2. Commit + Push
git add . && git commit -m "scale to 2 pods" && git push

# 3. ArgoCD จะเห็นการเปลี่ยนแปลง → deploy ให้อัตโนมัติ!
#    ดูใน UI → app จะ sync ใหม่
kubectl get pods
# → จะเห็น 2 pods!
```

---


## ☁️ Deploy Cloud จริง ต่างจาก Minikube ยังไง

| หัวข้อ | Minikube (localhost) | Cloud จริง (AWS EKS / GCP GKE) |
|--------|---------------------|-------------------------------|
| **K8s cluster** | `minikube start` (บนเครื่องเรา) | สร้างผ่าน cloud console / Terraform |
| **Docker image** | build ตรงใน Minikube ได้ | ต้อง push ไป Registry (ECR/GCR) |
| **เข้าถึง app** | `minikube service` (NodePort) | Load Balancer + Domain name |
| **SSL/HTTPS** | ไม่มี | ต้องใส่ cert-manager + Let's Encrypt |
| **CI/CD** | ไม่จำเป็น (build มือ) | จำเป็น (GitHub Actions / Jenkins) |
| **ค่าใช้จ่าย** | ฟรี | ~$70-200+/เดือน |
| **Scale** | จำกัดตาม RAM เครื่อง | scale ได้เกือบไม่จำกัด |
| **Downtime** | ปิดเครื่อง = หยุด | ทำงาน 24/7 |

### สิ่งที่เหมือนกัน (ใช้ซ้ำได้เลย):

- `Dockerfile` — ใช้ได้เหมือนเดิม
- `helm/` chart — ใช้ได้เลย แค่แก้ values.yaml
- `argocd/` config — ใช้ได้ แค่แก้ repoURL

### สิ่งที่ต้องเพิ่มเมื่อขึ้น cloud จริง:

```
➕ CI/CD pipeline (GitHub Actions / Jenkins)
   → auto build image + push ไป registry

➕ Container Registry (AWS ECR / GCP GCR)
   → ที่เก็บ image

➕ Ingress Controller + Domain
   → ให้ user เข้าผ่าน https://myapp.com

➕ SSL Certificate
   → HTTPS (cert-manager + Let's Encrypt)

➕ Monitoring + Logging
   → Prometheus, Grafana, ELK

➕ Secret Management
   → Vault / Sealed Secrets
```

### ตัวอย่างถ้าใช้ AWS EKS:

```bash
# 1. สร้าง cluster
eksctl create cluster --name my-app --region ap-southeast-1

# 2. Push image ไป ECR
aws ecr create-repository --repository-name hello-app
docker build -t 123456.dkr.ecr.ap-southeast-1.amazonaws.com/hello-app:v1 .
docker push 123456.dkr.ecr.ap-southeast-1.amazonaws.com/hello-app:v1

# 3. แก้ values.yaml
# image.repository → ECR URL
# service.type → LoadBalancer

# 4. Deploy ด้วย Helm เหมือนเดิม!
helm install hello-app ./helm/hello-app
```

---

## 📁 โครงสร้างโปรเจกต์

```
deploy-tutorial/
├── index.js              # Express app (GET / + GET /health)
├── package.json          # Node.js dependencies
├── Dockerfile            # วิธีสร้าง Docker image
├── .dockerignore         # ไฟล์ที่ไม่ใส่ใน image
├── helm/
│   └── hello-app/
│       ├── Chart.yaml        # ข้อมูล Helm chart
│       ├── values.yaml       # ค่า config (เปลี่ยนตรงนี้)
│       └── templates/
│           ├── deployment.yaml   # บอก K8s รัน app ยังไง
│           └── service.yaml      # เปิดทางเข้า app
├── argocd/
│   └── application.yaml  # ArgoCD GitOps config
└── README.md             # คู่มือนี้
```

---

## 💡 สรุป

| เครื่องมือ | ทำอะไร |
|-----------|--------|
| **Docker** | บรรจุ app ลงกล่อง (container) |
| **Kubernetes** | จัดการกล่องให้ทำงานตลอด ไม่ล่ม |
| **Helm** | จัดการ config ของ K8s ให้เป็นระเบียบ |
| **ArgoCD** | auto deploy เมื่อ Git เปลี่ยน (GitOps) |

```
สิ่งที่เราทำ:
  เขียน code → ใส่ Docker → Deploy ขึ้น K8s ด้วย Helm → ArgoCD ดูแล auto deploy
```
