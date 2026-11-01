# CN360 Industrial Destination Dispatch Elevator Supervisory System

[![Course](https://img.shields.io/badge/Course-CN360%20Embedded%20System-blue.svg)](https://www.tu.ac.th)
[![Institution](https://img.shields.io/badge/Institution-Thammasat%20University-red.svg)](https://engr.tu.ac.th)
[![Platform](https://img.shields.io/badge/Controller-Node--RED%20%7C%20MQTT%20%7C%20WebSocket-green.svg)](http://localhost:1880)
[![Broker](https://img.shields.io/badge/Broker-Eclipse%20Mosquitto%20(Port%201883)-orange.svg)](https://mosquitto.org)

> โครงงานออกแบบและพัฒนาระบบควบคุมลิฟต์อุตสาหกรรมแบบเลือกชั้นปลายทางล่วงหน้า (Destination Dispatch System)  
> ตามข้อกำหนดในข้อสอบกลางภาควิชา **CN360 การออกแบบระบบสมองกลฝังตัว (Embedded System Design)**  
> ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์

---

## โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Directory Structure)

```text
CN360_Elevator_Project/
├── source_code/
│   ├── index.html                       # หน้าจอ Industrial Supervisory SCADA Console
│   ├── cn360_complete_exam_flow.json    # โฟลว์ระบบประมวลผลกลางบน Node-RED + MQTT
│   └── mqtt_client_test.js              # สคริปต์ทดสอบรับส่งข้อมูลผ่าน MQTT Broker
├── presentation/
│   ├── SLIDES_CONTENT_GUIDE.md          # สรุปเนื้อหาสำหรับทำสไลด์นำเสนอ (CLO1 - CLO4)
│   └── CN360_Elevator_Dispatch_Slides.pdf # (วางไฟล์สไลด์ PDF หรือ PPTX ที่นี่)
├── demo/
│   ├── DEMO_RECORDING_SCRIPT.md         # บทและขั้นตอนสำหรับการอัดคลิปวิดีโอสาธิต
│   └── CN360_Elevator_Demo.mp4          # (วางไฟล์คลิปวิดีโอสาธิต หรือแนบลิงก์ด้านล่าง)
└── README.md                            # คู่มือการติดตั้งและคำอธิบายระบบโดยละเอียด
```

---

## วิดีโอและสไลด์นำเสนอ (Presentation & Demo Links)

- **สไลด์นำเสนอ:** ไฟล์อยู่ในโฟลเดอร์ `presentation/CN360_Elevator_Dispatch_Slides.pdf`
- **วิดีโอสาธิตระบบ:** วางไฟล์ `CN360_Elevator_Demo.mp4` ในโฟลเดอร์ `demo/` หรือรับชมผ่านลิงก์:
  - *YouTube / Google Drive Link:* `[ใส่ลิงก์คลิปวิดีโอที่นี่]`

---

## ข้อกำหนดของระบบตามข้อสอบ CN360 (Exam Specifications)

1. **ขนาดอาคารและลิฟต์:**
   - อาคารสำนักงานสูง **20 ชั้น** (FL 01 – 20)
   - ลิฟต์โดยสาร **4 ตัว** (CAR A, B, C, D) อยู่ในโถงเดียวกัน
   - แผงหน้าลิฟต์ (Hall Unit) รวม **21 ชุด** (ชั้น 1 มี 2 ชุด, ชั้น 2-20 ชั้นละ 1 ชุด)
2. **พลศาสตร์และการเคลื่อนที่:**
   - เวลาเดินทาง: **2.0 วินาทีต่อชั้น**
   - เวลาจอดรับ-ส่งผู้โดยสาร: **10.0 วินาทีต่อครั้ง**
3. **ระบบสิทธิ์บัตร RFID (13.56 MHz):**
   - `CARD_ADMIN` : มีสิทธิ์เข้าถึงทุกชั้น (ชั้น 1 – 20)
   - `CARD_USER1` : สิทธิ์พนักงานวิศวกรรม (ชั้น 1, 2, 3, 4, 16)
   - `CARD_GUEST` : สิทธิ์ผู้มาติดต่อ (ชั้น 1, 2 เท่านั้น)
   - `CARD_UNKNOWN` : บัตรไม่ได้รับอนุญาต (ถูกปฏิเสธทุกชั้น)
4. **ฟังก์ชันคำนวณต้นทุนเวลา (Cost Function - ข้อ 3ข):**
   $$\text{Cost} = (\Delta \text{Floor} \times 2.0\text{s}) + (\text{Stops Ahead} \times 10.0\text{s})$$
   - **กฎตัดสิทธิ์ 1:** ลิฟต์ที่มีน้ำหนักเกิน **80%** ถูกตัดสิทธิ์ทันที (`Overload Lockout`)
   - **กฎตัดสิทธิ์ 2:** ลิฟต์ที่ขาด Heartbeat เกิน **3.0 วินาที** ถูกตัดสิทธิ์ทันที (`Comm Error Timeout`)
   - **กรณีโจทย์ข้อ 3(ข):** ผู้โดยสารอยู่ที่ชั้น 4 เลือกไปชั้น 16 -> ระบบคำนวณและมอบหมาย **CAR A** ด้วยเวลา **4.0 วินาที** ตรงตามเฉลยข้อสอบ
5. **ระบบความปลอดภัย (Safety & Fire Emergency):**
   - เมื่อเกิดเหตุเพลิงไหม้ ลิฟต์ทุกลำยกเลิกคิวงานและกลับสู่ **ชั้น 1 (Phase I Recall)** เพื่อเปิดประตูอพยพผู้โดยสารทันที พร้อมทั้งงดรับคำขอใหม่

---

## สถาปัตยกรรม MQTT (M2M Topics Architecture)

ระบบเชื่อมต่อกับ **Mosquitto MQTT Broker** ที่พอร์ต `1883` โดยใช้หัวข้อ Topics ตามมาตรฐานดังนี้:

| MQTT Topic | ทิศทาง | รายละเอียดและ Payload ตัวอย่าง |
| :--- | :---: | :--- |
| `elevator/hall/{floor}/call_req` | Hall -> Broker | คำขอเรียกลิฟต์: `{"from_floor": 4, "target_floor": 16, "card_id": "CARD_USER1"}` |
| `elevator/hall/{floor}/assign` | Broker -> Hall | ผลการจัดสรรลิฟต์: `{"status": "SUCCESS", "assigned_car": "A", "cost": 4}` |
| `elevator/car/{id}/command` | Broker -> Car | คำสั่งควบคุมตู้ลิฟต์: `{"car": "A", "add_stops": [4, 16]}` |
| `elevator/telemetry/cars` | Broker -> Bus | Telemetry สถานะลิฟต์ A, B, C, D อัปเดตทุก 1 วินาที |
| `elevator/safety/fire_alarm` | Sensor -> Broker | สัญญาณเพลิงไหม้: `{"fire": true}` หรือ `{"fire": false}` (ยกเลิก) |
| `elevator/system/reset` | System -> Broker | คำสั่งรีเซ็ตสถานะระบบ: `{"reset": true}` |

---

## ขั้นตอนการติดตั้งและรันระบบ (Quick Start Guide)

เพื่อให้เพื่อนในกลุ่มสามารถนำโปรเจกต์ไปรันบนเครื่องตนเองได้ ให้ทำตามขั้นตอนดังนี้ครับ:

### สิ่งที่ต้องมีในเครื่อง (Prerequisites)
1. **Node.js** (เวอร์ชัน 16 หรือใหม่กว่า) -> [ดาวน์โหลด Node.js](https://nodejs.org)
2. **Node-RED** -> ติดตั้งผ่านคำสั่ง: `npm install -g --unsafe-perm node-red`
3. **Eclipse Mosquitto MQTT Broker** -> [ดาวน์โหลด Mosquitto](https://mosquitto.org/download)

---

### ขั้นตอนที่ 1: สตาร์ท Mosquitto MQTT Broker
เปิด Command Prompt หรือ PowerShell ในสิทธิ์ Administrator แล้วตรวจสอบหรือเริ่มบริการ:
```powershell
net start mosquitto
```
*(Broker จะเริ่มทำงานและรอรับการเชื่อมต่อที่ `127.0.0.1:1883`)*

---

### ขั้นตอนที่ 2: เริ่มต้นใช้งาน Node-RED และนำเข้าโฟลว์ (Import Flow)
1. เปิด Terminal แล้วพิมพ์คำสั่งเพื่อสตาร์ท Node-RED:
   ```powershell
   node-red
   ```
2. เปิดเบราว์เซอร์แล้วเข้าไปที่: **`http://localhost:1880`**
3. คลิกปุ่มเมนูมุมขวาบน (สัญลักษณ์สามขีด `≡`) -> เลือก **Import**
4. เลือกไฟล์ **`source_code/cn360_complete_exam_flow.json`** แล้วกดปุ่ม **Import**
5. กดปุ่มสีแดง **Deploy** ที่มุมขวาบนของ Node-RED

---

### ขั้นตอนที่ 3: เปิดหน้าจอ Industrial Supervisory SCADA
1. เข้าไปที่โฟลเดอร์ `source_code/`
2. ดับเบิ้ลคลิกเปิดไฟล์ **`index.html`** บนเว็บเบราว์เซอร์ (Google Chrome หรือ Edge)
3. สังเกตสถานะด้านบนจะแสดง:
   - `ENGINE: [LIVE WS & MQTT: CONNECTED]`
   - `MQTT BROKER: tcp://127.0.0.1:1883 [ACTIVE]`
   - ลิฟต์ทั้ง 4 ตัวจะแสดงตำแหน่งและสายสลิงพร้อมทำงาน

---

### ขั้นตอนที่ 4: การทดสอบส่งคำขอผ่าน MQTT Terminal (Optional)
หากต้องการทดสอบการรับส่งข้อมูลผ่าน MQTT Broker โดยตรงเพื่อบันทึกคลิปหรือแสดงให้อาจารย์ดู สามารถเปิด Terminal ในโฟลเดอร์ `source_code/` แล้วรัน:
```powershell
node mqtt_client_test.js
```
ระบบจะส่งคำขอจำลองชั้น 4 ไปชั้น 16 และจะได้รับข้อความมอบหมายลิฟต์ A จาก Node-RED ทาง MQTT ทันที

---

## วิธีการใช้งานหน้าจอ SCADA (User Guide)

1. **แตะบัตร RFID (Panel II):**
   - คลิกที่บัตร `CARD_USER1` (หรือ `CARD_ADMIN`)
   - ระบบจะส่งเสียง Chime และเริ่มนับถอยหลัง **10 วินาที** พร้อมเรืองแสงแป้นพิมพ์ในปุ่มที่กดได้
2. **เลือกชั้นเป้าหมาย:**
   - กดปุ่มตัวเลขบน Keypad เช่น กด `1` และ `6` (Target: 16)
   - หากเผลอกดชั้นเดียวกันกับที่ยืนอยู่ ระบบจะแนะนำและล้างค่าให้อัตโนมัติ
3. **ส่งคำขอเรียกลิฟต์:**
   - กดปุ่ม **`[ ENGAGE DISPATCH REQUEST ]`**
   - ระบบส่วนกลางจะประเมิน Cost Function และมอบหมายลิฟต์ที่ดีที่สุด (เช่น CAR A)
   - ลิฟต์จะเคลื่อนที่มารับ เปิดประตูรับผู้โดยสาร และนำส่งถึงชั้นปลายทาง
4. **ทดสอบปุ่มฉุกเฉิน (Emergency Fire Alarm):**
   - กดปุ่มสีแดง **`EMERGENCY FIRE ALARM`**
   - ลิฟต์ทุกลำจะถูกบังคับเดินทางกลับสู่ **ชั้น 1** และเปิดประตูค้างไว้เพื่อการอพยพ
   - กดปุ่มเดิมซ้ำเพื่อกดยกเลิกและรีเซ็ตระบบกลับสู่สภาวะปกติ

