---
name: Physics PlayLab
description: ห้องทดลองฟิสิกส์แบบเกมสำหรับนักเรียนมัธยม
colors:
  ocean-deep: "#0d4f6b"
  ocean-mid: "#1a7fa0"
  island-green: "#4caf50"
  lab-background: "#060c16"
  lab-surface: "#0b1a2e"
  lab-accent: "#00e5ff"
  lab-success: "#69f0ae"
  lab-warning: "#ffd740"
  lab-text: "#e8f4ff"
typography:
  title:
    fontFamily: "Nunito, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Nunito, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Nunito, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.lab-accent}"
    textColor: "{colors.lab-background}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.lab-surface}"
    textColor: "{colors.lab-text}"
    rounded: "{rounded.md}"
    padding: "16px"
---

## Overview

ระบบภาพเป็นห้องทดลองดิจิทัลที่เชื่อมกับโลกเกาะของ Physics PlayLab ใช้พื้นที่ฉากทดลองเป็นจุดเด่น และให้แผงควบคุมทำหน้าที่สนับสนุนงานโดยไม่แย่งความสนใจจากการเคลื่อนที่ของวัตถุ

## Colors

พื้นผิวห้องทดลองใช้สีน้ำเงินเกือบดำเพื่อให้กล้อง วัตถุ และข้อมูลอ่านง่าย สีฟ้าใช้กับการโต้ตอบและข้อมูลสด สีเขียวใช้กับความสำเร็จ และสีเหลืองใช้กับคำเตือนหรือจุดที่ต้องสังเกต สีเน้นต้องสื่อสถานะ ไม่ใช้เป็นของตกแต่งทั่วหน้า

## Typography

ใช้ Nunito หนึ่งตระกูลทั้งระบบเพื่อรักษาความเป็นมิตรและความสม่ำเสมอ ค่าตัวเลขและสูตรใช้ตัวเลขแบบ monospace ภายในพื้นที่ข้อมูลเท่านั้น หัวข้อในแผงควบคุมมีขนาดกระชับและไม่ใช้ตัวอักษรแบบ display

## Elevation

ใช้การแบ่งชั้นด้วยความเข้มของพื้นผิวและเส้นขอบโปร่งบาง เงาใช้เฉพาะ HUD หรือองค์ประกอบที่ลอยเหนือฉากจริง และต้องมีระยะสั้นเพื่อไม่ให้เกิดการ์ดเรืองแสงซ้อนกัน

## Components

ปุ่มหลักใช้สี lab accent และมีสถานะ hover, focus, active และ disabled ชัดเจน แผงควบคุมมีรัศมีไม่เกิน 12px ส่วน badge ใช้ทรง pill ได้ ข้อมูลสดควรคงขนาดช่องไว้เพื่อไม่ให้ layout ขยับเมื่อค่าตัวเลขเปลี่ยน

## Do's and Don'ts

ให้ผู้เรียนเห็นฉากทดลองและสถานะภารกิจพร้อมกัน ใช้ภาษาไทยสำหรับ UI และใช้มาสคอตเมื่อมี feedback เชิงการเรียนรู้ ห้ามบังคับเปิดกล้อง ห้ามใช้สีอย่างเดียวบอกว่าสำเร็จ และหลีกเลี่ยงแผงซ้อนแผงหรือ motion ที่ไม่สื่อการเปลี่ยนสถานะ
