// ===== LAB PAGE TRANSLATIONS =====
import type { Translations } from '@/lib/i18n'

export const LAB: Translations = {
  // Controls
  'lab.start': { th: 'เริ่ม', en: 'Start' },
  'lab.pause': { th: 'หยุดชั่วคราว', en: 'Pause' },
  'lab.resume': { th: 'เล่นต่อ', en: 'Resume' },
  'lab.reset': { th: 'รีเซ็ต', en: 'Reset' },
  'lab.back': { th: 'กลับ', en: 'Back' },
  'lab.next': { th: 'ต่อไป', en: 'Next' },
  'lab.startExperiment': { th: 'เริ่มทดลอง', en: 'Start Experiment' },
  'lab.onBothSides': { th: 'ทั้งสองฝ่าย', en: 'on both sides' },
  'lab.formulasUsed': { th: 'สูตรที่ใช้', en: 'Formulas Used' },
  'lab.initialHeight': { th: 'ความสูงตั้งต้น', en: 'Initial height' },
  'lab.launchSpeed': { th: 'ความเร็วตั้งต้น', en: 'Initial speed' },
  'lab.displacement': { th: 'การกระจัด', en: 'Displacement' },
  'lab.pushForce': { th: 'แรงผลัก', en: 'Force' },
  'lab.appliedForce': { th: 'แรงกระทำ', en: 'Applied force' },
  'lab.nuto1Mass': { th: 'มวล Nuto 1', en: 'Nuto 1 mass' },
  'lab.nuto2Mass': { th: 'มวล Nuto 2', en: 'Nuto 2 mass' },
  'lab.finish': { th: 'เสร็จสิ้นการทดลอง', en: 'Finish Experiment' },
  'lab.saved': { th: 'บันทึกสำเร็จ! กำลังกลับ...', en: 'Saved! Returning...' },
  'lab.summary': { th: 'ผลการทดลอง', en: 'Experiment Results' },
  'lab.tryAgain': { th: 'ทดลองอีกครั้ง', en: 'Try Again' },
  'lab.saveBack': { th: 'บันทึกและกลับ', en: 'Save and Return' },
  'lab.resetComplete': { th: 'รีเซ็ตเรียบร้อย ปรับค่าใหม่ได้เลยครับ!', en: 'Reset complete! Adjust parameters.' },
  'lab.resuming': { th: 'ดำเนินการต่อ...', en: 'Resuming...' },
  'lab.experimentComplete': { th: 'การทดลองเสร็จสิ้นแล้วครับ!', en: 'Experiment complete!' },

  // Parameters
  'lab.params': { th: 'พารามิเตอร์', en: 'Parameters' },
  'lab.time': { th: 'เวลา', en: 'Time' },
  'lab.distance': { th: 'ระยะทาง', en: 'Distance' },
  'lab.velocity': { th: 'ความเร็ว', en: 'Velocity' },
  'lab.acceleration': { th: 'ความเร่ง', en: 'Acceleration' },
  'lab.initialVelocity': { th: 'ความเร็วต้น', en: 'Initial Velocity' },
  'lab.angle': { th: 'มุม', en: 'Angle' },
  'lab.mass': { th: 'มวล', en: 'Mass' },
  'lab.force': { th: 'แรง', en: 'Force' },
  'lab.friction': { th: 'แรงเสียดทาน', en: 'Friction' },
  'lab.height': { th: 'ความสูง', en: 'Height' },

  // Graph
  'lab.graph': { th: 'กราฟ', en: 'Graph' },
  'lab.data': { th: 'ข้อมูล', en: 'Data' },
  'lab.realtime': { th: 'เรียลไทม์', en: 'Real-time' },

  // Camera / Hand Tracking
  'lab.camera.title': { th: 'Hand Tracking (ไม่บังคับ)', en: 'Hand Tracking (Optional)' },
  'lab.camera.optional': { th: 'คุณสามารถใช้ปุ่มควบคุมปกติได้', en: 'You can use normal controls' },
  'lab.camera.enable': { th: 'เปิดใช้งานกล้อง', en: 'Enable Camera' },
  'lab.camera.disable': { th: 'ปิดกล้อง', en: 'Disable Camera' },
  'lab.camera.notAvailable': { th: 'กล้องไม่พร้อมใช้งาน', en: 'Camera not available' },
  'lab.camera.permission': { th: 'กรุณาอนุญาตการเข้าถึงกล้อง', en: 'Please allow camera access' },
  'lab.camera.gesture': { th: 'ใช้มือควบคุมได้', en: 'Control with your hand' },

  // Presets
  'lab.preset.earth': { th: 'โลก', en: 'Earth' },
  'lab.preset.moon': { th: 'ดวงจันทร์', en: 'Moon' },
  'lab.preset.mars': { th: 'ดาวอังคาร', en: 'Mars' },
  'lab.preset.jupiter': { th: 'ดาวพฤหัสบดี', en: 'Jupiter' },

  // Status
  'lab.status.running': { th: 'กำลังทำงาน', en: 'Running' },
  'lab.status.paused': { th: 'หยุดชั่วคราว', en: 'Paused' },
  'lab.status.finished': { th: 'เสร็จสิ้น', en: 'Finished' },
  'lab.status.ready': { th: 'พร้อม', en: 'Ready' },
  'lab.chart.waiting': { th: 'รอข้อมูล', en: 'Waiting for data' },

  // Instructions
  'lab.instruction.adjust': { th: 'ปรับค่าพารามิเตอร์และกด Start', en: 'Adjust parameters and press Start' },
  'lab.instruction.observe': { th: 'สังเกตกราฟและการเคลื่อนที่', en: 'Observe the graph and motion' },
  'lab.instruction.experiment': { th: 'ทดลองค่าต่างๆ และดูผล', en: 'Experiment with different values' },
}
