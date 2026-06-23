# 📖 คำสั่ง Terminal ที่ต้องรู้

รวมคำสั่งที่ใช้บ่อยในการ deploy — แบ่งตามเครื่องมือ

---

## 🐳 Docker

```bash
# ─── Build ───
docker build -t <ชื่อ-image>:<tag> .        # สร้าง image จาก Dockerfile ใน folder ปัจจุบัน
docker build -t hello-app:latest .          # ตัวอย่าง
docker build -t hello-app:v2 .              # build แล้วตั้ง tag เป็น v2

# ─── ดู image ───
docker images                               # ดู image ทั้งหมดที่มี
docker images | grep hello-app              # ดูเฉพาะ image ที่ชื่อ hello-app

# ─── รัน container ───
docker run -p 3000:3000 hello-app:latest    # รัน image + map port 3000
docker run -d -p 3000:3000 hello-app        # -d = รันใน background
docker run --rm -p 3000:3000 hello-app      # --rm = ลบ container เมื่อหยุด

# ─── จัดการ container ───
docker ps                                   # ดู container ที่กำลังรันอยู่
docker ps -a                                # ดูทั้งหมด (รวมที่หยุดแล้ว)
docker stop <container-id>                  # หยุด container
docker rm <container-id>                    # ลบ container
docker logs <container-id>                  # ดู log ของ container
docker exec -it <container-id> sh           # เข้าไปข้างใน container (เหมือน SSH)

# ─── ลบ ───
docker rmi <image-id>                       # ลบ image
docker system prune                         # ลบของที่ไม่ใช้ทั้งหมด (ระวัง!)
```

---

## ☸️ kubectl (Kubernetes)

```bash
# ─── ดูข้อมูล (GET) ───
kubectl get nodes                           # ดู node ทั้งหมดใน cluster
kubectl get pods                            # ดู pod ทั้งหมด
kubectl get pods -w                         # ดู pod แบบ watch (เห็น status เปลี่ยน realtime)
kubectl get services                        # ดู service ทั้งหมด
kubectl get deployments                     # ดู deployment ทั้งหมด
kubectl get all                             # ดูทุกอย่าง

# ─── ดูรายละเอียด ───
kubectl describe pod <pod-name>             # ดูรายละเอียด pod (debug ได้ดี)
kubectl describe service <svc-name>         # ดูรายละเอียด service
kubectl describe deployment <deploy-name>   # ดูรายละเอียด deployment

# ─── ดู log ───
kubectl logs <pod-name>                     # ดู log ของ pod
kubectl logs <pod-name> -f                  # ดู log แบบ follow (realtime)
kubectl logs <pod-name> --tail=50           # ดู 50 บรรทัดล่าสุด

# ─── เข้าไปใน pod ───
kubectl exec -it <pod-name> -- sh           # เข้า shell ใน pod (debug)

# ─── Deploy / อัปเดต ───
kubectl apply -f <file.yaml>                # สร้าง/อัปเดต resource จากไฟล์
kubectl delete -f <file.yaml>               # ลบ resource จากไฟล์
kubectl rollout restart deployment/<name>   # restart pod (ดึง image ใหม่)
kubectl rollout status deployment/<name>    # ดูสถานะ rollout
kubectl rollout undo deployment/<name>      # rollback ไป version ก่อนหน้า

# ─── Scale ───
kubectl scale deployment/<name> --replicas=3   # เพิ่ม pod เป็น 3 ตัว
kubectl scale deployment/<name> --replicas=1   # ลดกลับเหลือ 1

# ─── Port forward (เข้าถึง pod โดยตรง) ───
kubectl port-forward pod/<pod-name> 3000:3000      # เข้า pod ผ่าน localhost:3000
kubectl port-forward svc/<svc-name> 8080:80        # เข้า service ผ่าน localhost:8080

# ─── Namespace ───
kubectl get pods -n argocd                  # ดู pod ใน namespace "argocd"
kubectl get all -n argocd                   # ดูทุกอย่างใน namespace
kubectl create namespace <name>            # สร้าง namespace ใหม่

# ─── ลบ ───
kubectl delete pod <pod-name>               # ลบ pod (deployment จะสร้างใหม่)
kubectl delete deployment <name>            # ลบ deployment + pod ทั้งหมด
kubectl delete service <name>               # ลบ service
```

---

## ⎈ Helm

```bash
# ─── Install (Deploy) ───
helm install <release-name> <chart-path>    # deploy app
helm install hello-app ./helm/hello-app     # ตัวอย่าง

# ─── ดูข้อมูล ───
helm list                                   # ดู release ทั้งหมดที่ deploy อยู่
helm status <release-name>                  # ดูสถานะ release

# ─── อัปเดต ───
helm upgrade <release-name> <chart-path>    # อัปเดต (แก้ values แล้ว upgrade)
helm upgrade hello-app ./helm/hello-app     # ตัวอย่าง

# ─── Override ค่า ───
helm install hello-app ./helm/hello-app --set replicaCount=3          # override ค่าตอน install
helm install hello-app ./helm/hello-app -f my-values.yaml             # ใช้ values file อื่น

# ─── Debug (ดู YAML ที่จะ deploy จริง) ───
helm template hello-app ./helm/hello-app    # แสดง YAML ที่ render แล้ว (ไม่ deploy)
helm install hello-app ./helm/hello-app --dry-run   # จำลอง install (ไม่ deploy จริง)

# ─── ลบ ───
helm uninstall <release-name>               # ลบ release (ลบทุก resource ที่สร้าง)
helm uninstall hello-app                    # ตัวอย่าง

# ─── Rollback ───
helm history <release-name>                 # ดูประวัติ revision
helm rollback <release-name> <revision>     # rollback ไป revision ก่อนหน้า
```

---

## 🚐 Minikube

```bash
# ─── จัดการ cluster ───
minikube start                              # สร้าง + เริ่ม cluster
minikube stop                               # หยุด (ไม่ลบ)
minikube delete                             # ลบ cluster ทิ้ง
minikube status                             # ดูสถานะ

# ─── เข้าถึง app ───
minikube service <service-name>             # เปิด browser ไปที่ service
minikube service <service-name> --url       # ดู URL อย่างเดียว

# ─── Docker ───
eval $(minikube docker-env)                 # ใช้ Docker ของ Minikube
eval $(minikube docker-env -u)              # กลับไปใช้ Docker Desktop

# ─── Dashboard ───
minikube dashboard                          # เปิด K8s Dashboard (UI) ใน browser

# ─── Addons ───
minikube addons list                        # ดู addon ทั้งหมด
minikube addons enable ingress              # เปิด ingress controller
minikube addons enable metrics-server       # เปิด metrics (ดู CPU/RAM)
```

---

## 🔄 ArgoCD

```bash
# ─── Login ───
argocd login localhost:8080 --insecure      # login (ใช้หลัง port-forward)

# ─── App ───
argocd app list                             # ดู app ทั้งหมด
argocd app get <app-name>                   # ดูรายละเอียด app
argocd app sync <app-name>                  # สั่ง sync ทันที (ไม่ต้องรอ)
argocd app history <app-name>               # ดูประวัติ deploy

# ─── Rollback ───
argocd app rollback <app-name> <revision>   # rollback ไป revision ก่อนหน้า
```

---

## 📦 npm (Node.js)

```bash
npm install                                 # ติดตั้ง dependencies
npm start                                   # รัน app (node index.js)
npm run <script>                            # รัน script ที่กำหนดใน package.json
```

---

## 🔑 คำสั่งที่ใช้บ่อยสุดในโปรเจกต์นี้

```bash
# ─── เริ่มต้น ───
minikube start
eval $(minikube docker-env)

# ─── Build + Deploy ───
docker build -t hello-app:latest .
helm install hello-app ./helm/hello-app

# ─── ดูผล ───
kubectl get pods
minikube service hello-app-hello-app

# ─── แก้ code แล้ว deploy ใหม่ ───
docker build -t hello-app:latest .
kubectl rollout restart deployment/hello-app-hello-app

# ─── เก็บกวาด ───
helm uninstall hello-app
minikube stop
```

---

## 💡 Tips

- `kubectl get pods -w` — ใส่ `-w` (watch) เพื่อดู status เปลี่ยน realtime
- `kubectl describe pod <name>` — ดู "Events" ข้างล่างสุดเมื่อ debug ปัญหา
- `kubectl logs <pod> -f` — ดู log realtime (เหมือน `tail -f`)
- ถ้า pod ไม่ Running → ดู `kubectl describe pod` ก่อน แล้วดู `kubectl logs`
- `helm template` — ดู YAML จริงๆ ที่จะ deploy (ตรวจก่อน install ได้)
