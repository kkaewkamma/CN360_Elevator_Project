# CN360 Elevator Dispatch System - Presentation Slides Guide
> สำหรับนำเนื้อหาไปวางใน PowerPoint, Canva หรือ Google Slides เพื่อทำ `CN360_Elevator_Dispatch_Slides.pdf` (.pptx)

---

### Slide 1: หน้าปก (Title Slide)
- **หัวข้อ:** CN360 Industrial Destination Dispatch Elevator Supervisory System
- **หัวข้อย่อย:** การออกแบบและพัฒนาระบบลิฟต์อัจฉริยะแบบเลือกชั้นปลายทางล่วงหน้าด้วย Node-RED & MQTT
- **วิชา:** CN360 การออกแบบระบบสมองกลฝังตัวและระบบควบคุมอุตสาหกรรม
- **คณะ:** ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์
- **สมาชิกกลุ่ม:** [ระบุชื่อ-นามสกุล, เลขทะเบียนนักศึกษา]

---

### Slide 2: วัตถุประสงค์และปัญหา (Problem Statement & CLO)
- **โจทย์ข้อสอบ CN360 Midterm 1/2569:**
  - อาคารสำนักงาน 20 ชั้น (FL 01 - 20) มีลิฟต์ 4 ตัว (A, B, C, D)
  - ต้องการเปลี่ยนจากระบบกดเรียกลิฟต์แบบดั้งเดิม เป็นระบบ **Destination Dispatch** ร่วมกับการแตะบัตร RFID
  - ลดเวลารอเฉลี่ย (Waiting Time) และจำกัดสิทธิ์ความปลอดภัยในแต่ละชั้น
- **ผลลัพธ์การเรียนรู้ (CLOs):**
  - **CLO1:** สถาปัตยกรรมระบบสมองกลฝังตัว & การเลือกอุปกรณ์ (RFID, SCADA, Actuator)
  - **CLO2:** การเขียนโปรแกรมขับเคลื่อนด้วยเหตุการณ์ (Event-Driven) & State Machine 10s Timer
  - **CLO3:** การออกแบบโปรโตคอลการสื่อสาร MQTT / M2M & การจัดการข้อผิดพลาด
  - **CLO4:** สถาปัตยกรรมซอฟต์แวร์ศูนย์กลาง & อัลกอริทึม Cost Dispatching

---

### Slide 3: สถาปัตยกรรมระบบโดยรวม (System Architecture)
- **ภาพรวม 3 ระดับ:**
  1. **Hall Terminal (แผงหน้าชั้น 21 ชุด):** เครื่องอ่าน RFID 13.56 MHz, แป้นกดเลือกชั้น, หน้าจอ VFD, สัญญาณเสียง
  2. **Car Units (ตู้ลิฟต์ A, B, C, D):** จอแสดงสถานะชั้นที่จะจอด, ปุ่มเปิด-ปิด, ปุ่มฉุกเฉิน, มอเตอร์ขับเคลื่อน 2.0s/ชั้น, ประตูจอด 10.0s
  3. **Central Supervisory Controller (Node-RED + Mosquitto MQTT Broker):** ตรวจสอบสิทธิ์บัตร, ประมวลผลคัดเลือกลิฟต์, Watchdog Heartbeat, และ Emergency Interlock
- **จุดเด่น:** Safety Chain แบบฮาร์ดแวร์อิสระ (Limit Switch, Governor) ตัดวงจรตรงไม่ผ่านซอฟต์แวร์

---

### Slide 4: ลำดับขั้นตอนผู้โดยสาร (Passenger Interaction Workflow)
- **ขั้นตอนการใช้งาน:**
  1. **Step 1 (Authentication):** แตะบัตร RFID ที่หน้าลิฟต์ -> ตรวจสอบสิทธิ์การเข้าถึงชั้นต้นทาง
  2. **Step 2 (Floor Selection):** กรอกชั้นปลายทางบน Keypad ภายใน **10 วินาที** (Time-out Window)
  3. **Step 3 (Dispatch Assignment):** หน้าจอแสดงผลว่าให้ไปขึ้นลิฟต์ตัวไหนทันที เช่น *"ไปขึ้นลิฟต์ [ CAR A ] เวลารอประมาณ 4s"*
  4. **Step 4 (Boarding):** เดินไปรอหน้าลิฟต์ที่กำหนด เมื่อลิฟต์มาถึงเปิดประตูรับผู้โดยสาร (ในลิฟต์ไม่มีปุ่มเลือกชั้น)
  5. **Step 5 (Arrival):** ลิฟต์นำส่งถึงชั้นเป้าหมายอย่างปลอดภัย

---

### Slide 5: อัลกอริทึมการเลือกลิฟต์และฟังก์ชันต้นทุน (Cost Evaluator - ข้อ 3ข)
- **สูตรคำนวณต้นทุนเวลา (Cost Function):**
  $$\text{Cost} = (\Delta \text{Floor} \times 2.0\text{s}) + (\text{Stops Ahead} \times 10.0\text{s})$$
- **กฎการตัดสิทธิ์ทันที (Pruning Rules):**
  - **Rule 1 (Heartbeat Timeout):** ตัดลิฟต์ที่ขาดการสื่อสารเกิน 3.0s ออกทันที
  - **Rule 2 (Overload Lockout):** ตัดลิฟต์ที่มีน้ำหนักบรรทุกเกิน 80%
  - **Rule 3 (Direction Consistency):** ลิฟต์กำลังวิ่งต้องรับผู้โดยสารในทิศทางเดียวกันและอยู่ข้างหน้าอย่างน้อย 1 ชั้น
- **การพิสูจน์โจทย์ข้อสอบ (ผู้โดยสารชั้น 4 ไปชั้น 16):**
  - **CAR A (FL 2 UP 50% [9, 16]):** $Cost = (4 - 2) \times 2.0 + 0 = 4.0\text{s}$ -> **BEST CANDIDATE**
  - **CAR B (FL 12 DN 30% [6, 1]):** กำลังวิ่งลงคนละทิศทาง -> Penalty 100s
  - **CAR C (FL 3 UP 90% [5]):** โหลด 90% -> **PRUNED (>80% Overload)**
  - **CAR D (FL 1 IDLE 0% HB 6s):** ขาด Heartbeat 6s -> **PRUNED (>3.0s Timeout)**

---

### Slide 6: สถาปัตยกรรม MQTT และโพรโทคอลสื่อสาร (MQTT Topics)
- **Broker:** Mosquitto MQTT (`tcp://127.0.0.1:1883`)
- **โครงสร้าง Topics M2M:**
  - `elevator/hall/{floor}/call_req` : ส่งคำขอเรียกลิฟต์จากแผงหน้าชั้น
  - `elevator/hall/{floor}/assign` : ส่งผลการจัดสรรลิฟต์กลับไปยังแผงชั้น
  - `elevator/car/{id}/command` : สั่งการตู้ลิฟต์ไปรับ-ส่งตามชั้น
  - `elevator/telemetry/cars` : Broadcast สถานะ Real-time ทุก 1 วินาที
  - `elevator/safety/fire_alarm` : สัญญาณฉุกเฉินเหตุเพลิงไหม้ (Emergency Interlock)

---

### Slide 7: ความปลอดภัยและระบบฉุกเฉิน (Safety & Emergency Interlock)
- **Phase I Fire Recall Operation:**
  - เมื่อได้รับสัญญาณ Fire Alarm ลิฟต์ทุกลำจะยกเลิกคิวงานปกติทั้งหมด
  - เคลื่อนที่ลงมาจอดที่ **ชั้น 1 (Ground Floor)** ทันที
  - เปิดประตูค้างไว้เพื่ออพยพผู้โดยสาร และขึ้นสถานะ `OUT OF SERVICE`
  - ล็อคระบบแป้นพิมพ์และแผงแตะบัตรไม่รับคำขอใหม่จนกว่าเจ้าหน้าที่จะกดยกเลิก
- **Edge Case Protection:**
  - ตรวจสอบบัตรซ้ำก่อนส่ง (Prevent Unauthorized Floor Bypass)
  - ป้องกันการกดชั้นต้นทางและปลายทางเป็นชั้นเดียวกัน (`from == target`)
  - Boundary Clamp ควบคุมพิกัดไม่ให้หลุดออกนอกช่วงชั้น 1 - 20

---

### Slide 8: ภาพหน้าจอระบบ SCADA และวิดีโอสาธิต (SCADA & Demo)
- แสดงภาพหน้าจอ **Panel I, Panel II, Panel III**
- สาธิตการทดสอบทั้ง 4 กรณี:
  1. การแตะบัตร USER1 แล้วกดชั้น 16 -> มอบหมาย CAR A (4s)
  2. การแตะบัตร GUEST แล้วกดชั้น 16 -> แจ้งเตือนสิทธิ์ไม่ผ่าน (ACCESS DENIED)
  3. การหมดเวลา 10 วินาที -> หมดอายุสิทธิ์ ต้องแตะบัตรใหม่
  4. การกดปุ่ม Emergency Fire Alarm -> ลิฟต์ทุกลำกลับชั้น 1
- **GitHub Repository Link:** [ใส่ลิงก์ GitHub หลังอัปโหลด]

---

### Slide 9: สรุปผลการดำเนินงาน (Conclusion & Q&A)
- ระบบบรรลุตามข้อกำหนดของรายวิชา CN360 ครบทั้ง 4 CLOs
- สถาปัตยกรรม Node-RED + MQTT ทำงานร่วมกับหน้าจอ SCADA ได้แบบ Real-Time และเชื่อถือได้
- เปิดรับคำถามจากอาจารย์และผู้ฟัง (Q&A)

