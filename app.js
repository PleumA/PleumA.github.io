// Multi-language translation dictionaries
let currentLang = 'th';
try {
    currentLang = localStorage.getItem('schedule_lang');
    if (!currentLang || (currentLang !== 'th' && currentLang !== 'en')) {
        const nav = typeof window !== 'undefined' ? window.navigator : (typeof navigator !== 'undefined' ? navigator : null);
        const navLang = nav ? (nav.language || (nav.languages && nav.languages[0]) || '') : '';
        currentLang = navLang.toLowerCase().startsWith('th') ? 'th' : 'en';
        localStorage.setItem('schedule_lang', currentLang);
    }
} catch (e) {
    currentLang = 'en'; // Safe fallback if localStorage is disabled
}

const SHORTAGE_MARKER = "__SHORTAGE__";
const esc = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
        }
    });
};
const translations = {
    th: {
        title: "ระบบจัดตารางเวรอัตโนมัติ",
        subtitle: "คำนวณอย่างชาญฉลาดด้วย Smart Solver • ปรับปรุงตารางด้วยตนเองได้",
        calcBtn: "คำนวณตารางใหม่",
        basicSettings: "ตั้งค่าพื้นฐาน",
        monthLabel: "เดือน (1-12)",
        yearLabel: "ปี (พ.ศ. / ค.ศ.)",
        docListLabel: "รายชื่อแพทย์",
        docInputPlaceholder: "พิมพ์ชื่อแล้วกด Enter หรือจุลภาค (,)",
        specialHolsLabel: "วันหยุดพิเศษ (คั่นด้วย ,)",
        noDutyLabel: "วันที่งดเวร (ไม่ต้องมีคนอยู่)",
        docsPerDay: "จำนวนแพทย์ต่อวัน",
        defaultSlots: "จำนวนคน (ค่าเริ่มต้น)",
        customSlots: "กำหนดจำนวนคนเฉพาะวัน",
        addBtn: "เพิ่ม",
        customSlotsDesc: "ระบุจำนวนคนที่ต้องการใช้เฉพาะบางวันได้",
        offRequests: "วันขอพัก (Off)",
        offRequestsSelect: "เลือกแพทย์...",
        advSettings: "เงื่อนไขการจัดเวรขั้นสูง",
        strictRules: "กฎเหล็กบังคับ (ปิดไม่ได้)",
        ruleHoliday: "ห้ามอยู่เวรวันหยุดติดกัน (ส.-อา. + หยุดพิเศษ)",
        ruleOffDay: "ก่อนหน้าวัน Off 1 วัน จะต้องไม่มีเวรเสมอ",
        ruleConsecutive: "ห้ามอยู่เวรติดกันทุกกรณี",
        ruleConsecutiveDesc: "เว้นอย่างน้อย 1 วัน (รวมวันธรรมดา)",
        ruleGaps: "รักษาระยะห่างของเวร",
        ruleGapsDesc: "กระจายเวรไม่ให้เกิดช่องว่างที่นานเกินไป",
        ruleBalance: "เฉลี่ยภาระงานของแพทย์ (Balance Workload)",
        ruleBalanceDesc: "จัดตารางเวรโดยเฉลี่ยจำนวนเวรรวมของทุกคนให้เท่ากันที่สุด",
        ruleBlankDays: "อนุญาตให้เว้นว่าง (Allow Blank Days)",
        ruleBlankDaysDesc: "หากไม่มีแพทย์เพียงพอตามเงื่อนไข ระบบจะปล่อยวันนั้นว่างแทนที่จะบังคับลง",
        roleToggle: "โหมดแยกบทบาท (Role-Based)",
        lockSpecial: "ล็อครายชื่อเวรพิเศษ",
        lockDays: "ในช่วงกี่วันแรก?",
        lockDaysStart: "เริ่มวันที่ 1 ถึง",
        lockDocs: "รายชื่อแพทย์ 1 ในนี้",
        lockDesc: "*ระบบจะจับคู่คนในกลุ่มนี้ลงเวรทุกวัน โดยห้ามอยู่คู่กันเอง",
        docRolesLabel: "บทบาทของแพทย์ (เช่น A:R1, B:R2)",
        defaultRoleSlotsLabel: "จำนวนคนแยกตามบทบาท (เช่น R1:1, R2:1)",
        roleQuotasLabel: "กำหนดโควตาเวรแบบระบุจำนวน (เช่น R1:12, R2:10)",
        conflictListLabel: "แพทย์ที่ไม่สามารถอยู่เวรร่วมกันได้ (Conflict List)",
        conflictDesc: "*ระบุคู่ที่ขัดแย้งกัน เช่น A:B, C:D หรือ A conflicts with B",
        emptyStateTitle: "พร้อมสำหรับการจัดตาราง",
        emptyStateDesc: "กรอกชื่อแพทย์ให้ครบถ้วน จากนั้นคลิก \"คำนวณตารางใหม่\" เพื่อดูผลลัพธ์",
        statsTotal: "เวรรวมทั้งหมด",
        statsShortages: "เวรขาดแคลน",
        statsAvg: "เฉลี่ยเวร/คน",
        statsSpread: "ความต่างเวร",
        summaryTitle: "สรุปจำนวนเวรรายบุคคล",
        copySummaryBtn: "คัดลอกสรุป",
        totalShiftsLabel: "รวมทั้งหมด",
        shiftsUnit: "กะ",
        tableHeaderDoctors: "แพทย์",
        tableHeaderWorkdays: "ทำการ (จ-ศ)",
        tableHeaderHolidays: "หยุด (ส-อา, พิเศษ)",
        tableHeaderTotal: "รวมทั้งหมด",
        scheduleTitle: "ตารางเวรปฏิบัติงานจริง",
        tabTable: "รายการ",
        tabCalendar: "ปฏิทิน",
        tabPerson: "บุคคล",
        resetAllBtn: "คืนค่าระบบคำนวณทั้งหมด",
        copyExcelBtn: "คัดลอกตาราง (Excel)",
        exportExcelBtn: "โหลด .xlsx",
        tableDateCol: "วันที่",
        tableDayCol: "วัน",
        tableDutyCol: "เวร",
        tableNoteCol: "หมายเหตุ",
        resetCellBtn: "คืนค่าระบบคำนวณ",
        emptySlot: "- ว่าง",
        shortageSlot: "⚠️ ขาดคน",
        holidayLabel: "วันหยุด",
        specialHolidayLabel: "วันหยุดพิเศษ",
        noDutyBadge: "งดเวร",
        shortageWarning: "⚠️ ขาดคนลงเวร",
        offWarning: "⚠️ {name} ขอพัก (Off)",
        lockedBadge: "[ล็อคคิว: {name}]",
        noDutyNote: "[งดเวร]",
        daySun: "อา.",
        dayMon: "จ.",
        dayTue: "อ.",
        dayWed: "พ.",
        dayThu: "พฤ.",
        dayFri: "ศ.",
        daySat: "ส.",
        manualBtn: "คู่มือ",
        manualTitle: "คู่มือการใช้งานระบบจัดตารางเวร",
        manualIntro: "ระบบจัดตารางเวรนี้ คำนวณด้วยอัลกอริทึม Smart Solver (Monte Carlo Simulation) 300 รอบ เพื่อหาการกระจายเวรที่ดีที่สุด พร้อมทั้งรองรับเงื่อนไขหลากหลายรูปแบบดังนี้:",
        manualSection1Title: "1. การจัดการแพทย์และบทบาท (Roles)",
        manualSection1Body: "ระบุรายชื่อแพทย์ในรูปแบบ Tag และกำหนดบทบาทในกล่องข้อความ (เช่น <code>A:R1, B:R2</code>) ระบบจะจัดเวรแยกอิสระตามกลุ่มบทบาทแต่ละวัน (หากต้องการกำหนดโควตาที่จำนวนไม่พอดีกับช่องเวร โปรดเปิดใช้งาน Allow Blank Days)",
        manualSection2Title: "2. จำนวนเวรตามบทบาท (Slots)",
        manualSection2Body: "กำหนดจำนวนผู้ปฏิบัติงานต่อวัน เช่น <code>R1:1, R2:1</code> (หมายถึงต้องการ R1 1 คน และ R2 1 คน) และปรับเปลี่ยนเฉพาะบางวันได้ในระบบ 'กำหนดพิเศษ'",
        manualSection3Title: "3. แพทย์ที่ขัดแย้งกัน (Conflict List)",
        manualSection3Body: "ระบุแพทย์ที่ไม่สามารถอยู่เวรร่วมกันในวันเดียวกันได้ เช่น <code>A:B</code> หรือ <code>C conflicts with D</code> อัลกอริทึมจะคัดชื่อออกจากกลุ่มเลือกโดยอัตโนมัติ",
        manualSection4Title: "4. วันหยุดและวันพัก (Off Requests)",
        manualSection4Body: "ระบบห้ามจัดเวรซ้อนทับวัน Off หรือก่อนหน้าวัน Off 1 วัน และห้ามอยู่เวรวันหยุด (ส.-อา. + นักขัตฤกษ์) ติดกันเด็ดขาด",
        manualSection5Title: "5. การแก้ไขและตรวจสอบตาราง",
        manualSection5Body: "ท่านสามารถคลิกที่ชื่อแพทย์ในตารางหรือปฏิทินเพื่อเลือกสลับตัวแพทย์ด้วยตนเอง ระบบจะคำนวณสถิติใหม่พร้อมแสดงป้ายเตือนความขัดแย้ง (Conflict) หรือผิดบทบาท (Role Mismatch) ทันที",
        manualSection6Title: "6. การบันทึก/โหลดและการอัปเดตสถิติ",
        manualSection6Body: "ท่านสามารถส่งออกการตั้งค่าทั้งหมดเป็นไฟล์ JSON เพื่อนำกลับมาใช้ใหม่ได้ และเมื่อมีการแก้ไขเวรด้วยตนเอง กรุณากดปุ่ม 'ยืนยันการเปลี่ยนแปลง' เพื่อเริ่มคำนวณสรุปสถิติใหม่",
        manualSection7Title: "7. โหมดช่วงวันที่กำหนดเอง (Custom Date Range)",
        manualSection7Body: "คุณสามารถสลับเปิด 'ใช้ช่วงวันที่กำหนดเอง' เพื่อจัดเวรตามวันที่ต้องการ (สูงสุด 90 วัน) แทนการจัดเวรตามเดือนปกติ โดยกรอกวันที่ในรูปแบบ DD/MM/YYYY",
        customDateRangeToggle: "ใช้ช่วงวันที่กำหนดเอง",
        startDateLabel: "เริ่ม",
        endDateLabel: "สิ้นสุด",
        offRequestCustomNoteText: "ในโหมดช่วงวันที่กำหนดเอง กรุณาระบุวันในรูปแบบ DD/MM/YYYY เช่น 20/05/2026 (หรือ ค.ศ.)",
        roleSlotsPlaceholder: "เช่น R1:1, R2:1",
        roleQuotasPlaceholder: "เช่น R1:12, R2:10",
        csvPlaceholder1: "เช่น 13, 14, 15",
        csvPlaceholder2: "เช่น 15, 16",
        docRolesPlaceholder: "เช่น A:R1, B:R2, C:Staff"
    },
    en: {
        title: "Automatic On-Call Scheduler",
        subtitle: "Smart calculations with Solver • Manual schedule overrides supported",
        calcBtn: "Calculate Schedule",
        basicSettings: "Basic Settings",
        monthLabel: "Month (1-12)",
        yearLabel: "Year (AD / BE)",
        docListLabel: "Doctor List",
        docInputPlaceholder: "Type name and press Enter or comma (,)",
        specialHolsLabel: "Special Holidays (comma separated)",
        noDutyLabel: "No-Duty Days (no staff assigned)",
        docsPerDay: "Doctors per Day",
        defaultSlots: "Default Slots (default count)",
        customSlots: "Custom Daily Slots",
        addBtn: "Add",
        customSlotsDesc: "Specify slot count for specific dates",
        offRequests: "Off Requests",
        offRequestsSelect: "Select doctors...",
        advSettings: "Advanced Constraints",
        strictRules: "Strict Rules (always active)",
        ruleHoliday: "No consecutive holiday duties (Sat-Sun + Special)",
        ruleOffDay: "No duty the day before requested Off day",
        ruleConsecutive: "Prevent consecutive duties",
        ruleConsecutiveDesc: "At least 1 day gap (includes weekdays)",
        ruleGaps: "Maintain gap spacing",
        ruleGapsDesc: "Distribute duties to avoid long rest gaps",
        ruleBalance: "Balance Workload",
        ruleBalanceDesc: "Distribute shifts equally among all doctors",
        ruleBlankDays: "Allow Blank Days",
        ruleBlankDaysDesc: "If no eligible doctor is available, leave the slot blank instead of forcing",
        roleToggle: "Role-Based Mode",
        lockSpecial: "Lock Special Duty",
        lockDays: "During the first N days?",
        lockDaysStart: "Start Day 1 to",
        lockDocs: "List of locked doctors",
        lockDesc: "*System assigns exactly 1 doctor from this group daily, preventing them from pairing together.",
        docRolesLabel: "Doctor Roles (e.g. A:R1, B:R2)",
        defaultRoleSlotsLabel: "Slots per Role (e.g. R1:1, R2:1)",
        roleQuotasLabel: "Exact Monthly Quota (e.g. R1:12, R2:10)",
        conflictListLabel: "Conflict / Hate List (Cannot be on shift together)",
        conflictDesc: "*Enter pairs e.g. A:B, C:D or A conflicts with B",
        emptyStateTitle: "Ready to Schedule",
        emptyStateDesc: "Enter doctor names, then click \"Calculate Schedule\" to view results",
        statsTotal: "Total Duties",
        statsShortages: "Shortages",
        statsAvg: "Avg Duties/Doctor",
        statsSpread: "Workload Spread",
        summaryTitle: "Individual Duty Summary",
        copySummaryBtn: "Copy Summary",
        totalShiftsLabel: "Total",
        shiftsUnit: "shifts",
        tableHeaderDoctors: "Doctor",
        tableHeaderWorkdays: "Weekdays (Mon-Fri)",
        tableHeaderHolidays: "Holidays (Sat-Sun, Special)",
        tableHeaderTotal: "Total shifts",
        scheduleTitle: "Official Duty Schedule",
        tabTable: "List",
        tabCalendar: "Calendar",
        tabPerson: "Person",
        resetAllBtn: "Reset All Overrides",
        copyExcelBtn: "Copy Schedule (Excel)",
        exportExcelBtn: "Export .xlsx",
        tableDateCol: "Date",
        tableDayCol: "Day",
        tableDutyCol: "Duty",
        tableNoteCol: "Notes",
        resetCellBtn: "Reset to Auto",
        emptySlot: "- Open",
        shortageSlot: "⚠️ Shortage",
        holidayLabel: "Weekend / Holiday",
        specialHolidayLabel: "Special Holiday",
        noDutyBadge: "No Duty",
        shortageWarning: "⚠️ Shortage of doctors",
        offWarning: "⚠️ {name} requested Off",
        lockedBadge: "[Locked: {name}]",
        noDutyNote: "[No Duty]",
        daySun: "Sun",
        dayMon: "Mon",
        dayTue: "Tue",
        dayWed: "Wed",
        dayThu: "Thu",
        dayFri: "Fri",
        daySat: "Sat",
        manualBtn: "Manual",
        manualTitle: "User Manual & Guide",
        manualIntro: "This scheduler uses a Smart Solver algorithm (Monte Carlo Simulation) running 300 iterations to find the fairest workload distribution, satisfying these criteria:",
        manualSection1Title: "1. Doctors & Roles Setup",
        manualSection1Body: "Add doctors as tags, then map them to roles (e.g., <code>A:R1, B:R2</code>). The system allocates duties within each role pool independently. (If you want to use unbalanced exact quotas, please turn on Allow Blank Days).",
        manualSection2Title: "2. Slots & Daily Demands",
        manualSection2Body: "Set daily needs like <code>R1:1, R2:1</code> (requiring 1 R1 and 1 R2). Define date-specific overrides in 'Custom Daily Slots'.",
        manualSection3Title: "3. Conflict / Hate List",
        manualSection3Body: "Define doctors who cannot work on the same shift (e.g., <code>A:B</code> or <code>C conflicts with D</code>). The solver automatically excludes them from matching pools.",
        manualSection4Title: "4. Holidays & Off Requests",
        manualSection4Body: "The scheduler enforces strict rules: no shifts on Off days or the day prior, and no consecutive holiday/weekend duties.",
        manualSection5Title: "5. Manual Overrides & Warnings",
        manualSection5Body: "Click any doctor's name in Table or Calendar to manually override. The system updates workload stats and displays real-time warning badges for conflicts or role mismatches.",
        manualSection6Title: "6. Save/Load Config & Stats Sync",
        manualSection6Body: "Export configuration state as a JSON backup file to instantly reload later. When making manual overrides, click 'Confirm Changes' to sync and recalculate summary reports.",
        manualSection7Title: "7. Custom Date Range Mode",
        manualSection7Body: "Toggle 'Use Custom Date Range' to schedule duties across any arbitrary dates (up to 90 days) instead of rigid months. Dates should be formatted as DD/MM/YYYY.",
        customDateRangeToggle: "Use Custom Date Range",
        startDateLabel: "Start Date",
        endDateLabel: "End Date",
        offRequestCustomNoteText: "In custom date range mode, please enter date as DD/MM/YYYY e.g., 20/05/2026 (AD year)",
        roleSlotsPlaceholder: "e.g. R1:1, R2:1",
        roleQuotasPlaceholder: "e.g. R1:12, R2:10",
        csvPlaceholder1: "e.g. 13, 14, 15",
        csvPlaceholder2: "e.g. 15, 16",
        docRolesPlaceholder: "e.g. A:R1, B:R2, C:Staff"
    }
};

// Default doctors populated to give a stunning starting look
let doctors = ['A', 'B', 'C', 'D', 'E', 'F'];
let offData = [];
let extraSlotsData = [];
let globalResult = null;
let isInitialLoad = true;
let viewMode = 'table'; // 'table' or 'calendar'
let isCustomDateRange = false;
let scheduleDates = [];

// Manual override object tracking custom cell edits
// Format: { [day]: { [slotIndex]: docName } }
let manualOverrides = {};

// Dark Mode state
let darkMode = localStorage.getItem('schedule_dark') === 'true';

// Initial setup on document load
document.addEventListener('DOMContentLoaded', () => {
    const d = new Date();
    document.getElementById('inputMonth').value = d.getMonth() + 1;
    document.getElementById('inputYear').value = currentLang === 'th' ? d.getFullYear() + 543 : d.getFullYear();

    // Sync default doctors
    syncDoctorsToInput();
    renderDoctorTags();
    renderSpecialDocsCheckboxList();

    // Custom Date Range Listener
    const chkCustom = document.getElementById('chkCustomDateRange');
    if (chkCustom) {
        chkCustom.addEventListener('change', function (e) {
            isCustomDateRange = e.target.checked;
            const customContainer = document.getElementById('customDateRangeContainer');
            const monthYearContainer = document.getElementById('standardMonthYearContainer');
            const btnCalendarView = document.getElementById('btnCalendarView');
            const offNote = document.getElementById('offRequestCustomNote');

            if (isCustomDateRange) {
                customContainer.classList.remove('hidden');
                monthYearContainer.classList.add('hidden');
                if (btnCalendarView) btnCalendarView.classList.add('hidden');
                if (offNote) offNote.classList.remove('hidden');
                if (viewMode === 'calendar') window.setViewMode('table');
                window.handleCustomDateRangeChange();
            } else {
                customContainer.classList.add('hidden');
                monthYearContainer.classList.remove('hidden');
                if (btnCalendarView) btnCalendarView.classList.remove('hidden');
                if (offNote) offNote.classList.add('hidden');
                generateSchedule();
            }
        });
    }

    // Apply language i18n
    applyTranslations();

    // Apply dark mode theme
    applyDarkMode();

    // Show manual automatically on first visit
    try {
        if (!localStorage.getItem('hasSeenManual')) {
            setTimeout(() => {
                if (typeof window.openManualModal === 'function') {
                    window.openManualModal();
                }
            }, 800);
            localStorage.setItem('hasSeenManual', 'true');
        }
    } catch (e) {
        // Ignored if localStorage is unavailable
    }

    // Set up listeners for the tag input text box
    const docInput = document.getElementById('doctorInput');
    docInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = this.value.trim().replace(/,/g, '');
            if (value) {
                addDoctor(value);
                this.value = '';
            }
        } else if (e.key === 'Backspace' && this.value === '') {
            if (doctors.length > 0) {
                doctors.pop();
                syncDoctorsToInput();
                renderDoctorTags();
                generateSchedule();
            }
        }
    });

    // Handle paste of comma separated lists
    docInput.addEventListener('input', function () {
        if (this.value.includes(',')) {
            const parts = this.value.split(',');
            const lastPart = parts.pop();
            parts.forEach(part => {
                addDoctor(part);
            });
            this.value = lastPart;
        }
    });

    // Click container to focus input
    const tagContainer = document.getElementById('doctorTagsContainer');
    tagContainer.addEventListener('click', () => {
        docInput.focus();
    });

    // Initial render elements
    renderOffRequests();
    renderExtraSlots();
    toggleSpecialRuleUI();

    // Listeners for new inputs
    const rolesInput = document.getElementById('inputDoctorRoles');
    if (rolesInput) {
        rolesInput.addEventListener('change', () => generateSchedule());
    }
    const defaultRoleSlotsInput = document.getElementById('inputDefaultRoleSlots');
    if (defaultRoleSlotsInput) {
        defaultRoleSlotsInput.addEventListener('change', () => generateSchedule());
    }
    const roleQuotasInput = document.getElementById('inputRoleQuotas');
    if (roleQuotasInput) {
        roleQuotasInput.addEventListener('change', () => generateSchedule());
    }
    const conflictsInput = document.getElementById('inputConflicts');
    if (conflictsInput) {
        conflictsInput.addEventListener('change', () => generateSchedule());
    }
    const preventConsecutiveInput = document.getElementById('chkPreventConsecutive');
    if (preventConsecutiveInput) {
        preventConsecutiveInput.addEventListener('change', () => generateSchedule());
    }
    const preventLongGapsInput = document.getElementById('chkPreventLongGaps');
    if (preventLongGapsInput) {
        preventLongGapsInput.addEventListener('change', () => generateSchedule());
    }
    const balanceShiftsInput = document.getElementById('chkBalanceShifts');
    if (balanceShiftsInput) {
        balanceShiftsInput.addEventListener('change', () => generateSchedule());
    }
    const allowBlankDaysInput = document.getElementById('chkAllowBlankDays');
    if (allowBlankDaysInput) {
        allowBlankDaysInput.addEventListener('change', () => generateSchedule());
    }
    const roleBasedInput = document.getElementById('chkRoleBased');
    if (roleBasedInput) {
        roleBasedInput.addEventListener('change', () => {
            toggleRoleBasedUI();
            generateSchedule();
        });
    }

    const defaultSlotsInput = document.getElementById('inputDefaultSlots');
    if (defaultSlotsInput) {
        defaultSlotsInput.addEventListener('change', () => generateSchedule());
    }
    const monthInput = document.getElementById('inputMonth');
    if (monthInput) {
        monthInput.addEventListener('change', () => generateSchedule());
    }
    const yearInput = document.getElementById('inputYear');
    if (yearInput) {
        yearInput.addEventListener('change', () => generateSchedule());
    }
    const specialHolsInput = document.getElementById('inputSpecialHols');
    if (specialHolsInput) {
        specialHolsInput.addEventListener('change', () => generateSchedule());
    }
    const noDutyInput = document.getElementById('inputNoDuty');
    if (noDutyInput) {
        noDutyInput.addEventListener('change', () => generateSchedule());
    }
    const specialDocsInput = document.getElementById('inputSpecialDocs');
    if (specialDocsInput) {
        specialDocsInput.addEventListener('change', () => generateSchedule());
    }
    const specialDaysInput = document.getElementById('inputSpecialDays');
    if (specialDaysInput) {
        specialDaysInput.addEventListener('change', () => generateSchedule());
    }

    const inputStartDate = document.getElementById('inputStartDate');
    if (inputStartDate) {
        inputStartDate.addEventListener('change', () => window.handleCustomDateRangeChange());
    }
    const inputEndDate = document.getElementById('inputEndDate');
    if (inputEndDate) {
        inputEndDate.addEventListener('change', () => window.handleCustomDateRangeChange());
    }

    // Sync roles mapping input
    syncDoctorRolesInput();
    toggleRoleBasedUI();

    // Start automatic calculation
    setTimeout(() => {
        generateSchedule();
        window.initialized = true;
    }, 200);
});

// Toggle Role-Based settings visibility
function toggleRoleBasedUI() {
    const isOn = document.getElementById('chkRoleBased')?.checked;
    const panel = document.getElementById('roleBasedSettings');
    if (panel) {
        panel.style.display = isOn ? '' : 'none';
    }
}

// Close dropdown selectors when clicking outside
document.addEventListener('click', () => {
    const dropdowns = document.querySelectorAll('[id^="dropdown-"]');
    dropdowns.forEach(d => d.classList.add('hidden'));

    const cellDropdowns = document.querySelectorAll('[id^="celldropdown-"], [id^="tablecelldropdown-"]');
    cellDropdowns.forEach(d => d.classList.add('hidden'));
});

// Language Translation Handler
window.toggleLanguage = function () {
    currentLang = currentLang === 'th' ? 'en' : 'th';
    localStorage.setItem('schedule_lang', currentLang);

    // Auto convert year between BE / AD format
    const yearInput = document.getElementById('inputYear');
    if (yearInput) {
        let yearVal = parseInt(yearInput.value);
        if (!isNaN(yearVal)) {
            if (currentLang === 'en' && yearVal > 2500) {
                yearInput.value = yearVal - 543;
            } else if (currentLang === 'th' && yearVal < 2200) {
                yearInput.value = yearVal + 543;
            }
        }
    }

    applyTranslations();
    showToast(currentLang === 'th' ? "เปลี่ยนภาษาเป็นไทยแล้ว" : "Language switched to English");
};

function applyTranslations() {
    const lang = currentLang;

    // Set document language attribute
    document.documentElement.lang = lang === 'th' ? 'th' : 'en';

    // Update simple text elements
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Check if it's an input field placeholder
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', translations[lang][key]);
            } else {
                // Safely replace text node without breaking lucide icons inside buttons
                let textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.nodeValue = translations[lang][key];
                } else {
                    el.innerText = translations[lang][key];
                }
            }
        }
    });

    // Update HTML elements (preserves rich formatting like <code> tags)
    const htmlElements = document.querySelectorAll('[data-i18n-html]');
    htmlElements.forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update placeholders manually to be safe
    const docInput = document.getElementById('doctorInput');
    if (docInput) {
        docInput.placeholder = translations[lang]['docInputPlaceholder'];
    }

    const specialHolsInput = document.getElementById('inputSpecialHols');
    if (specialHolsInput) {
        specialHolsInput.placeholder = lang === 'th' ? 'เช่น 13, 14, 15' : 'e.g. 13, 14, 15';
    }

    const noDutyInput = document.getElementById('inputNoDuty');
    if (noDutyInput) {
        noDutyInput.placeholder = lang === 'th' ? 'เช่น 15, 16' : 'e.g. 15, 16';
    }

    // Update language toggle button text
    const btnLang = document.getElementById('btnLanguage');
    if (btnLang) {
        btnLang.innerText = lang === 'th' ? 'EN' : 'ไทย';
    }

    // Update calendar header grid days
    const calHeaders = document.getElementById('calendarHeaderDays');
    if (calHeaders) {
        calHeaders.innerHTML = `
            <div class="text-rose-500 py-1 uppercase tracking-wider">${translations[lang].daySun}</div>
            <div class="py-1 uppercase tracking-wider">${translations[lang].dayMon}</div>
            <div class="py-1 uppercase tracking-wider">${translations[lang].dayTue}</div>
            <div class="py-1 uppercase tracking-wider">${translations[lang].dayWed}</div>
            <div class="py-1 uppercase tracking-wider">${translations[lang].dayThu}</div>
            <div class="py-1 uppercase tracking-wider">${translations[lang].dayFri}</div>
            <div class="text-rose-500 py-1 uppercase tracking-wider">${translations[lang].daySat}</div>
        `;
    }

    // Re-render components with the new language
    if (globalResult) {
        updateDayNamesLanguage();
        renderResults();
        updateStatsDashboard();
    }

    renderOffRequests();
    renderExtraSlots();
    renderSpecialDocsCheckboxList();
}

function updateDayNamesLanguage() {
    if (!globalResult) return;

    const year = parseInt(document.getElementById('inputYear').value);
    const month = parseInt(document.getElementById('inputMonth').value);
    const calcYear = year > 2500 ? year - 543 : year;

    const thDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const enDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    globalResult.schedule.forEach(row => {
        const dateObj = new Date(calcYear, month - 1, row.day);
        const dayIndex = dateObj.getDay();
        row.dayName = currentLang === 'th' ? thDays[dayIndex] : enDays[dayIndex];

        // Reconstruct warning flags using active language i18n
        updateDayNote(row);
    });
}

// Dark Mode Handler
window.toggleDarkMode = function () {
    darkMode = !darkMode;
    localStorage.setItem('schedule_dark', darkMode);
    applyDarkMode();
    showToast(currentLang === 'th' ?
        (darkMode ? "เปิดโหมดมืดแล้ว" : "ปิดโหมดมืดแล้ว") :
        (darkMode ? "Dark mode enabled" : "Light mode enabled")
    );
};

function applyDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById('iconDarkMode');

    if (darkMode) {
        html.classList.add('dark');
        if (icon) icon.setAttribute('data-lucide', 'sun');
    } else {
        html.classList.remove('dark');
        if (icon) icon.setAttribute('data-lucide', 'moon');
    }

    lucide.createIcons();
}

// Tag Chip Input functions
function syncDoctorsToInput() {
    document.getElementById('inputDoctors').value = doctors.join(', ');
}

function syncDoctorRolesInput() {
    const roleInput = document.getElementById('inputDoctorRoles');
    if (!roleInput) return;

    const currentRoles = {};
    roleInput.value.split(/[\n,]+/).forEach(part => {
        const pair = part.split(':');
        if (pair.length === 2) {
            const doc = pair[0].trim();
            const role = pair[1].trim();
            if (doc && role) {
                currentRoles[doc] = role;
            }
        }
    });

    const newRolesArr = [];
    doctors.forEach((doc, index) => {
        let role = currentRoles[doc];
        if (!role) {
            role = index % 2 === 0 ? 'R1' : 'R2';
        }
        newRolesArr.push(`${doc}:${role}`);
    });

    roleInput.value = newRolesArr.join(', ');
}

function renderDoctorTags() {
    const container = document.getElementById('doctorTagsContainer');
    const inputField = document.getElementById('doctorInput');

    // Remove all existing tag badges
    const tags = container.querySelectorAll('.doctor-tag');
    tags.forEach(tag => tag.remove());

    // Draw tag badges
    doctors.forEach((doc, index) => {
        const tag = document.createElement('span');
        tag.className = 'doctor-tag bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-900/50 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 select-none animate-in fade-in scale-95 duration-200';
        tag.innerHTML = `
            <span></span>
            <button type="button" onclick="event.stopPropagation(); removeDoctor(${index})" class="text-teal-400 hover:text-teal-600 transition-colors">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
        `;
        tag.querySelector('span').textContent = doc;
        container.insertBefore(tag, inputField);
    });

    lucide.createIcons();
    updateDoctorSelectors();
}

function addDoctor(name) {
    name = name.trim();
    if (!name) return;
    if (doctors.includes(name)) {
        showToast(currentLang === 'th' ? "มีชื่อแพทย์ท่านนี้ในระบบแล้ว" : "This doctor is already in the system", true);
        return;
    }
    doctors.push(name);
    syncDoctorsToInput();
    syncDoctorRolesInput();
    renderDoctorTags();
    generateSchedule();
}

function removeDoctor(index) {
    const name = doctors[index];
    if (!name) return;
    doctors = doctors.filter((_, i) => i !== index);

    // Also clean up overrides for this doctor
    Object.keys(manualOverrides).forEach(day => {
        Object.keys(manualOverrides[day]).forEach(slot => {
            if (manualOverrides[day][slot] === name) {
                delete manualOverrides[day][slot];
            }
        });
        if (Object.keys(manualOverrides[day]).length === 0) {
            delete manualOverrides[day];
        }
    });

    syncDoctorsToInput();
    syncDoctorRolesInput();
    renderDoctorTags();
    generateSchedule();
}

function updateDoctorSelectors() {
    // Update dropdown values inside Off requests list
    offData.forEach(req => {
        const dropdown = document.getElementById(`dropdown-${req.id}`);
        if (dropdown) {
            dropdown.innerHTML = getDropdownOptionsHtml(req.id, req.names);
        }
    });

    // Update special lock choices
    renderSpecialDocsCheckboxList();
}

// Dropdown selection list for Off requests
function getDropdownOptionsHtml(reqId, selectedNamesStr) {
    const selectedNames = selectedNamesStr.split(',').map(n => n.trim()).filter(n => n);
    let optionsHtml = '';
    doctors.forEach((doc, index) => {
        const isChecked = selectedNames.includes(doc) ? 'checked' : '';
        optionsHtml += `
            <label class="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-semibold border-b border-slate-100 dark:border-slate-800 last:border-0">
                <input type="checkbox" value="${esc(doc)}" ${isChecked} onchange="toggleOffDoctorByIndex(${reqId}, ${index}, this.checked)" class="rounded text-orange-500 focus:ring-orange-200 w-4 h-4 dark:border-slate-700 dark:bg-slate-900">
                <span class="text-slate-700 dark:text-slate-200">${esc(doc)}</span>
            </label>
        `;
    });
    if (doctors.length === 0) {
        optionsHtml = `<div class="p-3 text-xs text-slate-400 text-center" data-i18n="offRequestsNoDocs">ไม่มีรายชื่อแพทย์</div>`;
    }
    return optionsHtml;
}

window.toggleDropdown = function (event, dropdownId) {
    event.stopPropagation();

    // Close other dropdowns
    const dropdowns = document.querySelectorAll('[id^="dropdown-"], [id^="celldropdown-"], [id^="tablecelldropdown-"]');
    dropdowns.forEach(d => {
        if (d.id !== dropdownId) d.classList.add('hidden');
    });

    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
};

window.toggleOffDoctor = function (reqId, doc, isChecked) {
    const index = offData.findIndex(o => o.id === reqId);
    if (index === -1) return;

    let selected = offData[index].names.split(',').map(n => n.trim()).filter(n => n);
    if (isChecked) {
        if (!selected.includes(doc)) selected.push(doc);
    } else {
        selected = selected.filter(d => d !== doc);
    }

    offData[index].names = selected.join(', ');

    const btnText = document.querySelector(`#offReqBtnText-${reqId}`);
    if (btnText) {
        btnText.innerText = selected.length > 0 ? selected.join(', ') : (currentLang === 'th' ? 'เลือกแพทย์...' : 'Select...');
    }

    generateSchedule();
};

window.toggleOffDoctorByIndex = function (reqId, index, isChecked) {
    const doc = doctors[index];
    if (doc) window.toggleOffDoctor(reqId, doc, isChecked);
};

// Render special lock selections
function renderSpecialDocsCheckboxList() {
    const container = document.getElementById('specialDocsCheckboxList');
    if (!container) return;

    const inputVal = document.getElementById('inputSpecialDocs').value;
    const selected = inputVal.split(',').map(d => d.trim()).filter(d => d);

    container.innerHTML = '';
    if (doctors.length === 0) {
        container.innerHTML = `<span class="text-xs text-slate-400 dark:text-slate-550">${currentLang === 'th' ? 'กรุณาเพิ่มรายชื่อแพทย์เพื่อตั้งค่า' : 'Please add doctors first'}</span>`;
        return;
    }

    doctors.forEach((doc, index) => {
        const isChecked = selected.includes(doc) ? 'checked' : '';
        const label = document.createElement('label');
        label.className = `flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-bold transition-all ${isChecked ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`;
        label.innerHTML = `
            <input type="checkbox" value="${esc(doc)}" ${isChecked} onchange="toggleSpecialDocByIndex(${index}, this.checked)" class="rounded text-indigo-600 focus:ring-indigo-200 w-3.5 h-3.5 dark:border-slate-700 dark:bg-slate-900">
            <span>${esc(doc)}</span>
        `;
        container.appendChild(label);
    });
}

window.toggleSpecialDoc = function (doc, isChecked) {
    const input = document.getElementById('inputSpecialDocs');
    let selected = input.value.split(',').map(d => d.trim()).filter(d => d);

    if (isChecked) {
        if (!selected.includes(doc)) selected.push(doc);
    } else {
        selected = selected.filter(d => d !== doc);
    }

    input.value = selected.join(', ');
    renderSpecialDocsCheckboxList();
    generateSchedule();
};

window.toggleSpecialDocByIndex = function (index, isChecked) {
    const doc = doctors[index];
    if (doc) window.toggleSpecialDoc(doc, isChecked);
};

// UI Handlers
function toggleSpecialRuleUI() {
    const isChecked = document.getElementById('chkUseSpecialRule').checked;
    const container = document.getElementById('specialRuleContainer');
    const body = document.getElementById('specialRuleBody');

    if (isChecked) {
        container.className = "rounded-2xl shadow-sm border bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 transition-all overflow-hidden";
        body.style.display = 'block';
    } else {
        container.className = "rounded-2xl shadow-sm border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all overflow-hidden";
        body.style.display = 'none';
    }
    if (window.initialized) {
        generateSchedule();
    }
}

function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    const safeMsg = esc(msg);

    if (isError) {
        toastContent.className = "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm border bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50";
        toastContent.innerHTML = `<i data-lucide="alert-circle" class="w-6 h-6 text-red-500"></i> <span id="toastMsg">${safeMsg}</span>`;
    } else {
        toastContent.className = "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm border bg-slate-800 dark:bg-slate-950 text-white border-slate-700 dark:border-slate-800";
        toastContent.innerHTML = `<i data-lucide="check-circle-2" class="w-6 h-6 text-emerald-400"></i> <span id="toastMsg">${safeMsg}</span>`;
    }
    lucide.createIcons();

    toast.classList.remove('opacity-0', 'translate-y-8', 'scale-95', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0', 'scale-100');

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
        toast.classList.add('opacity-0', 'translate-y-8', 'scale-95', 'pointer-events-none');
    }, 3000);
}

function renderOffRequests() {
    const container = document.getElementById('offRequestsList');
    if (offData.length === 0) {
        container.innerHTML = `<p class="text-[12px] text-slate-400 dark:text-slate-550 text-center py-2">${translations[currentLang].offRequestsNoDocs}</p>`;
        return;
    }
    container.innerHTML = '';
    offData.forEach(req => {
        const div = document.createElement('div');
        div.className = "flex gap-2 items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800";

        const optionsHtml = getDropdownOptionsHtml(req.id, req.names);
        const selectedNames = req.names.split(',').map(n => n.trim()).filter(n => n);

        div.innerHTML = `
            <div class="w-16 shrink-0 font-sans">
                <input type="number" min="1" max="31" placeholder="วัน" value="${req.date}" onchange="updateOffRow(${req.id}, 'date', this.value)" class="w-full text-center border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100">
            </div>
            <div class="relative flex-1">
                <button type="button" onclick="toggleDropdown(event, 'dropdown-${req.id}')" class="w-full text-left border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-900 flex justify-between items-center hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <span id="offReqBtnText-${req.id}" class="truncate text-slate-700 dark:text-slate-200 font-semibold">${selectedNames.length > 0 ? selectedNames.join(', ') : (currentLang === 'th' ? 'เลือกแพทย์...' : 'Select...')}</span>
                    <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 shrink-0"></i>
                </button>
                <div id="dropdown-${req.id}" onclick="event.stopPropagation()" class="absolute left-0 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1 hidden max-h-48 overflow-y-auto custom-scrollbar">
                    ${optionsHtml}
                </div>
            </div>
            <button type="button" onclick="deleteOffRow(${req.id})" class="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

function addOffRow() {
    const newId = offData.length > 0 ? Math.max(...offData.map(o => o.id)) + 1 : 1;
    offData.push({ id: newId, date: '', names: '' });
    renderOffRequests();
}
function updateOffRow(id, field, value) {
    const index = offData.findIndex(o => o.id === id);
    if (index !== -1) {
        offData[index][field] = value;
        generateSchedule();
    }
}
function deleteOffRow(id) {
    offData = offData.filter(o => o.id !== id);
    renderOffRequests();
    generateSchedule();
}

function renderExtraSlots() {
    const container = document.getElementById('extraSlotsList');
    if (extraSlotsData.length === 0) {
        container.innerHTML = `<p class="text-[12px] text-slate-400 dark:text-slate-550 text-center py-2">${translations[currentLang].offRequestsNoDocs}</p>`;
        return;
    }
    container.innerHTML = '';
    extraSlotsData.forEach(item => {
        const div = document.createElement('div');
        div.className = "flex gap-2 items-center bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-950/35 font-sans";
        div.innerHTML = `
            <div class="w-20 shrink-0">
                <label class="text-[10px] text-slate-500 block">${translations[currentLang].tableDateCol}</label>
                <input type="number" min="1" max="31" value="${item.date}" onchange="updateExtraSlot(${item.id}, 'date', this.value)" class="w-full text-center border border-slate-200 dark:border-slate-800 rounded py-1 text-sm outline-none bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100">
            </div>
            <div class="w-28 shrink-0">
                <label class="text-[10px] text-slate-500 block">${translations[currentLang].defaultSlots}</label>
                <input type="text" value="${item.slots}" onchange="updateExtraSlot(${item.id}, 'slots', this.value)" class="w-full text-center border border-slate-200 dark:border-slate-800 rounded py-1 text-xs outline-none bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100" placeholder="เช่น 2 หรือ R1:1, R2:1">
            </div>
            <button onclick="deleteExtraSlot(${item.id})" class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors mt-4"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

function addExtraSlotRow() {
    const newId = extraSlotsData.length > 0 ? Math.max(...extraSlotsData.map(o => o.id)) + 1 : 1;
    const roleBased = document.getElementById('chkRoleBased')?.checked;
    const defaultVal = roleBased
        ? (document.getElementById('inputDefaultRoleSlots')?.value || 'R1:1, R2:1')
        : (document.getElementById('inputDefaultSlots')?.value || '2');
    extraSlotsData.push({ id: newId, date: '', slots: defaultVal });
    renderExtraSlots();
}
function updateExtraSlot(id, field, value) {
    const index = extraSlotsData.findIndex(o => o.id === id);
    if (index !== -1) {
        extraSlotsData[index][field] = value;
        generateSchedule();
    }
}
function deleteExtraSlot(id) {
    extraSlotsData = extraSlotsData.filter(o => o.id !== id);
    renderExtraSlots();
    generateSchedule();
}

// View Mode Toggle
window.setViewMode = function (mode) {
    viewMode = mode;

    const btnTable = document.getElementById('btnTableView');
    const btnCal = document.getElementById('btnCalendarView');
    const btnPerson = document.getElementById('btnPersonView');

    const tableContainer = document.getElementById('tableViewContainer');
    const calendarContainer = document.getElementById('calendarViewContainer');
    const personContainer = document.getElementById('personViewContainer');

    // Reset styles
    [btnTable, btnCal, btnPerson].forEach(btn => {
        if (btn) btn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";
    });

    // Hide all
    if (tableContainer) tableContainer.classList.add('hidden');
    if (calendarContainer) calendarContainer.classList.add('hidden');
    if (personContainer) personContainer.classList.add('hidden');

    const activeClass = "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700";

    if (mode === 'table') {
        if (btnTable) btnTable.className = activeClass;
        if (tableContainer) tableContainer.classList.remove('hidden');
    } else if (mode === 'calendar') {
        if (btnCal) btnCal.className = activeClass;
        if (calendarContainer) calendarContainer.classList.remove('hidden');
    } else if (mode === 'person') {
        if (btnPerson) btnPerson.className = activeClass;
        if (personContainer) personContainer.classList.remove('hidden');
    }

    renderResults();
};

// --- Core Smart Logic & Optimization Solver ---

function parseUIConfig() {
    const year = parseInt(document.getElementById('inputYear').value);
    const month = parseInt(document.getElementById('inputMonth').value);
    const specialHolidaysInput = document.getElementById('inputSpecialHols').value;
    const noDutyDaysInput = document.getElementById('inputNoDuty').value;
    const defaultSlots = Math.min(parseInt(document.getElementById('inputDefaultSlots').value) || 2, 50);
    const useSpecialRule = document.getElementById('chkUseSpecialRule').checked;
    const specialRuleDocsInput = document.getElementById('inputSpecialDocs').value;
    const specialRuleDays = parseInt(document.getElementById('inputSpecialDays').value) || 0;
    const preventConsecutiveAll = document.getElementById('chkPreventConsecutive').checked;
    const preventLongGaps = document.getElementById('chkPreventLongGaps').checked;
    const balanceShifts = document.getElementById('chkBalanceShifts')?.checked;
    const allowBlankDays = document.getElementById('chkAllowBlankDays')?.checked;
    const roleBased = document.getElementById('chkRoleBased')?.checked;

    const calcYear = year > 2500 ? year - 543 : year;
    const specialHols = specialHolidaysInput.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    const noDutyDays = noDutyDaysInput.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    let numDays = scheduleDates.length;
    
    // Fallback for isolated test environments that don't trigger generateSchedule
    if (numDays === 0 && !isCustomDateRange) {
        numDays = new Date(calcYear, month, 0).getDate();
    }

    const holidaySet = new Set(specialHols);
    const noDutySet = new Set(noDutyDays);

    for (let d = 1; d <= numDays; d++) {
        const dateObj = (scheduleDates.length > 0) ? scheduleDates[d - 1] : new Date(calcYear, month - 1, d);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) holidaySet.add(d);
    }

    const offMap = {};
    offData.forEach(req => {
        const d = isCustomDateRange ? req.date.trim() : parseInt(req.date);
        if (d && req.names) {
            const namesArr = req.names.split(',').map(n => n.trim()).filter(n => n);
            if (!offMap[d]) offMap[d] = new Set();
            namesArr.forEach(n => offMap[d].add(n));
        }
    });

    const extraSlotsMap = {};
    extraSlotsData.forEach(req => {
        const d = isCustomDateRange ? req.date.trim() : parseInt(req.date);
        const s = req.slots;
        if (d && s) extraSlotsMap[d] = s;
    });

    const doctorRoles = {};
    doctors.forEach(doc => { doctorRoles[doc] = 'Default'; });
    if (roleBased) {
        const rolesText = document.getElementById('inputDoctorRoles')?.value || '';
        rolesText.split(/[\n,]+/).forEach(part => {
            const pair = part.split(':');
            if (pair.length === 2) {
                const doc = pair[0].trim();
                const role = pair[1].trim();
                if (doc && role) doctorRoles[doc] = role;
            }
        });
    }

    const defaultRoleSlots = {};
    if (roleBased) {
        const defaultRoleSlotsText = document.getElementById('inputDefaultRoleSlots')?.value || '';
        if (defaultRoleSlotsText.trim()) {
            defaultRoleSlotsText.split(/[\n,]+/).forEach(part => {
                const pair = part.split(':');
                if (pair.length === 2) {
                    const role = pair[0].trim();
                    const count = Math.min(parseInt(pair[1].trim()), 50);
                    if (role && !isNaN(count) && count > 0) defaultRoleSlots[role] = count;
                }
            });
        }
    }
    if (Object.keys(defaultRoleSlots).length === 0) defaultRoleSlots['Default'] = defaultSlots;

    const roleQuotas = {};
    if (roleBased) {
        const quotasText = document.getElementById('inputRoleQuotas')?.value || '';
        if (quotasText.trim()) {
            quotasText.split(/[\n,]+/).forEach(part => {
                const pair = part.split(':');
                if (pair.length === 2) {
                    const role = pair[0].trim();
                    const count = parseInt(pair[1].trim());
                    if (role && !isNaN(count) && count > 0) roleQuotas[role] = count;
                }
            });
        }
    }
    const hasRoleQuotas = Object.keys(roleQuotas).length > 0;

    const conflicts = [];
    const conflictsText = document.getElementById('inputConflicts').value || '';
    conflictsText.split(/[\n,]+/).forEach(part => {
        part = part.trim();
        if (!part) return;
        let pair = [];
        if (part.includes(' conflicts with ')) pair = part.split(' conflicts with ');
        else if (part.includes(' conflicts ')) pair = part.split(' conflicts ');
        else if (part.includes(':')) pair = part.split(':');
        else if (part.includes('-')) pair = part.split('-');
        else pair = part.split(/\s+/);

        if (pair.length >= 2) {
            const doc1 = pair[0].trim();
            const doc2 = pair[1].trim();
            if (doc1 && doc2) conflicts.push([doc1, doc2]);
        }
    });

    const getRoleSlotsForDay = (day) => {
        let key = day;
        if (isCustomDateRange) {
            const dateObj = scheduleDates[day - 1];
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            key = `${dd}/${mm}/${yyyy}`;
        }
        const slotsVal = extraSlotsMap[key];
        if (slotsVal === undefined) return { ...defaultRoleSlots };
        let dayRoleSlots = {};
        const slotsStr = String(slotsVal).trim();
        if (/^\d+$/.test(slotsStr)) {
            dayRoleSlots['Default'] = Math.min(parseInt(slotsStr), 50);
        } else {
            slotsStr.split(/[\n,]+/).forEach(part => {
                const pair = part.split(':');
                if (pair.length === 2) {
                    const role = pair[0].trim();
                    const count = Math.min(parseInt(pair[1].trim()), 50);
                    if (role && !isNaN(count) && count > 0) dayRoleSlots[role] = count;
                }
            });
        }
        if (Object.keys(dayRoleSlots).length === 0) dayRoleSlots['Default'] = defaultSlots;
        if (!roleBased) {
            let total = 0;
            Object.keys(dayRoleSlots).forEach(r => total += dayRoleSlots[r]);
            dayRoleSlots = { 'Default': total };
        }
        return dayRoleSlots;
    };

    const cleanName = name => name.trim().toLowerCase();
    const conflictSet = new Set();
    conflicts.forEach(([d1, d2]) => {
        conflictSet.add(`${cleanName(d1)}:${cleanName(d2)}`);
        conflictSet.add(`${cleanName(d2)}:${cleanName(d1)}`);
    });
    const areConflicting = (doc1, doc2) => conflictSet.has(`${cleanName(doc1)}:${cleanName(doc2)}`);

    const specialDocs = specialRuleDocsInput.split(',').map(d => d.trim()).filter(d => d);

    // Mathematical Validation (Fail-Safe) - only needs to run once per generation cycle
    if (roleBased && hasRoleQuotas) {
        let totalSlotsInMonth = 0;
        for (let d = 1; d <= numDays; d++) {
            if (!noDutySet.has(d)) {
                let dRoleSlots = getRoleSlotsForDay(d);
                Object.keys(dRoleSlots).forEach(role => totalSlotsInMonth += dRoleSlots[role]);
            }
        }
        let totalRequiredShifts = 0;
        doctors.forEach(doc => {
            const role = doctorRoles[doc] || 'Default';
            if (roleQuotas[role]) totalRequiredShifts += roleQuotas[role];
        });

        if (!allowBlankDays && totalRequiredShifts !== totalSlotsInMonth) {
            const diff = Math.abs(totalRequiredShifts - totalSlotsInMonth);
            const msgTH = totalRequiredShifts < totalSlotsInMonth 
                ? `ข้อผิดพลาด: โควตารวม (${totalRequiredShifts}) แต่มีทั้งหมด ${totalSlotsInMonth} ช่อง - กรุณาเพิ่มอีก ${diff} เวรในโควตา (หรือเปิดอนุญาตเว้นว่าง)`
                : `ข้อผิดพลาด: โควตารวม (${totalRequiredShifts}) แต่มีทั้งหมด ${totalSlotsInMonth} ช่อง - กรุณาลดโควตาลง ${diff} เวร`;
            const msgEN = totalRequiredShifts < totalSlotsInMonth 
                ? `Error: Quotas sum to ${totalRequiredShifts} but there are ${totalSlotsInMonth} slots — add ${diff} more shifts to any role.`
                : `Error: Quotas sum to ${totalRequiredShifts} but there are ${totalSlotsInMonth} slots — remove ${diff} shifts from any role.`;
            throw new Error(currentLang === 'th' ? msgTH : msgEN);
        } else if (allowBlankDays && totalRequiredShifts > totalSlotsInMonth) {
            const diff = totalRequiredShifts - totalSlotsInMonth;
            throw new Error(currentLang === 'th' ? `ข้อผิดพลาด: โควตารวม (${totalRequiredShifts}) เกินกว่าจำนวนเวรทั้งหมดในเดือน (${totalSlotsInMonth}) - กรุณาลดลง ${diff} เวร` : `Error: Quotas sum to ${totalRequiredShifts} but there are only ${totalSlotsInMonth} slots — remove ${diff} shifts.`);
        }
    }

    return {
        year, month, numDays, holidaySet, noDutySet, offMap,
        roleBased, doctorRoles, roleQuotas, hasRoleQuotas,
        useSpecialRule, specialDocs, specialRuleDays,
        preventConsecutiveAll, preventLongGaps, balanceShifts, allowBlankDays,
        getRoleSlotsForDay, areConflicting, specialHols
    };
}

// Single trial of greedy scheduling with added randomness
function generateSingleScheduleCandidate(randomness = 0, formatUI = false, config) {
    const {
        numDays, holidaySet, noDutySet, offMap,
        roleBased, doctorRoles, roleQuotas, hasRoleQuotas,
        useSpecialRule, specialDocs, specialRuleDays,
        preventConsecutiveAll, preventLongGaps, balanceShifts, allowBlankDays,
        getRoleSlotsForDay, areConflicting, month, year, specialHols
    } = config;

    const wCounts = {}; const hCounts = {}; const tCounts = {}; const lastShift = {};
    doctors.forEach(doc => { wCounts[doc] = 0; hCounts[doc] = 0; tCounts[doc] = 0; lastShift[doc] = -99; });

    const scheduleData = [];
    const scheduleMap = {};
    let maxSlotsFound = 0;

    // Pre-calculate remaining quotas vs remaining slots for probabilistic blank spacing
    let remainingRoleSlots = {};
    let remainingRoleQuotas = {};
    if (roleBased && allowBlankDays && hasRoleQuotas) {
        for (let d = 1; d <= numDays; d++) {
            if (!noDutySet.has(d)) {
                let dRoleSlots = getRoleSlotsForDay(d);
                Object.keys(dRoleSlots).forEach(role => {
                    remainingRoleSlots[role] = (remainingRoleSlots[role] || 0) + dRoleSlots[role];
                });
            }
        }
        doctors.forEach(doc => {
            const role = doctorRoles[doc] || 'Default';
            if (roleQuotas[role]) remainingRoleQuotas[role] = (remainingRoleQuotas[role] || 0) + roleQuotas[role];
        });
    }

    // Sort doctors by workload counters, with random perturbation for exploring alternatives
    const sortDoctors = (docsList, isHol) => {
        const noise = {};
        docsList.forEach(doc => {
            noise[doc] = (Math.random() - 0.5) * randomness;
        });

        docsList.sort((a, b) => {
            // Priority 1: Minimum Shift Quota Fulfillment
            if (roleBased && hasRoleQuotas) {
                const roleA = doctorRoles[a] || 'Default';
                const roleB = doctorRoles[b] || 'Default';
                const quotaA = roleQuotas[roleA] || 0;
                const quotaB = roleQuotas[roleB] || 0;

                const aNeedsQuota = quotaA > 0 && tCounts[a] < quotaA;
                const bNeedsQuota = quotaB > 0 && tCounts[b] < quotaB;

                if (aNeedsQuota && !bNeedsQuota) return -1;
                if (!aNeedsQuota && bNeedsQuota) return 1;

                if (aNeedsQuota && bNeedsQuota) {
                    const diffQuotaA = quotaA - tCounts[a];
                    const diffQuotaB = quotaB - tCounts[b];
                    if (diffQuotaA !== diffQuotaB) return diffQuotaB - diffQuotaA;
                }
            }

            if (balanceShifts) {
                if (isHol) {
                    const diff = (hCounts[a] + noise[a]) - (hCounts[b] + noise[b]);
                    if (Math.abs(diff) > 0.4) return diff;
                } else {
                    const diff = (wCounts[a] + noise[a]) - (wCounts[b] + noise[b]);
                    if (Math.abs(diff) > 0.4) return diff;
                }

                const diffT = (tCounts[a] + noise[a]) - (tCounts[b] + noise[b]);
                if (Math.abs(diffT) > 0.4) return diffT;
            }

            if (preventLongGaps) {
                const diffL = (lastShift[a] + noise[a] * 2) - (lastShift[b] + noise[b] * 2);
                if (Math.abs(diffL) > 0.4) return diffL;
            }
            return noise[a] - noise[b];
        });
    };

    for (let day = 1; day <= numDays; day++) {
        const isHoliday = holidaySet.has(day);
        const isNoDuty = noDutySet.has(day);
        
        let offKeyToday = day;
        let offKeyTomorrow = day + 1;
        if (isCustomDateRange) {
            const dateObj = scheduleDates[day - 1];
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            offKeyToday = `${dd}/${mm}/${yyyy}`;
            if (day < numDays) {
                const tomorrowObj = scheduleDates[day];
                const tm_dd = String(tomorrowObj.getDate()).padStart(2, '0');
                const tm_mm = String(tomorrowObj.getMonth() + 1).padStart(2, '0');
                const tm_yyyy = tomorrowObj.getFullYear();
                offKeyTomorrow = `${tm_dd}/${tm_mm}/${tm_yyyy}`;
            } else {
                offKeyTomorrow = null;
            }
        }
        
        const offToday = offMap[offKeyToday] || new Set();
        const offTomorrow = (offKeyTomorrow !== null && offMap[offKeyTomorrow]) ? offMap[offKeyTomorrow] : new Set();

        let slotsPerDay = 0;
        let dayRoleSlots = getRoleSlotsForDay(day);
        let daySlotsList = [];
        Object.keys(dayRoleSlots).forEach(role => {
            const count = dayRoleSlots[role];
            slotsPerDay += count;
            for (let i = 0; i < count; i++) {
                daySlotsList.push(role);
            }
        });

        if (slotsPerDay > maxSlotsFound) maxSlotsFound = slotsPerDay;

        let selected = [];

        if (isNoDuty) {
            scheduleMap[day] = [];
            for (let i = 0; i < slotsPerDay; i++) selected.push("-");
        } else {
            let chosenToday = [];
            let specialDoctorAssigned = false;
            let chosenSpecial = null;
            let specialRole = null;

            if (useSpecialRule && day <= specialRuleDays && specialDocs.length > 0) {
                let availableSpecial = specialDocs.filter(doc => {
                    // 1. Hard Quota Ceiling
                    if (roleBased && roleQuotas[doctorRoles[doc] || 'Default']) {
                        const quota = roleQuotas[doctorRoles[doc] || 'Default'];
                        if (tCounts[doc] >= quota) return false;
                    }
                    if (offToday.has(doc) || offTomorrow.has(doc)) return false;
                    const yesterdayDocs = scheduleMap[day - 1] || [];
                    if (isHoliday && holidaySet.has(day - 1) && yesterdayDocs.includes(doc)) return false;
                    if (preventConsecutiveAll && day > 1 && yesterdayDocs.includes(doc)) return false;
                    return true;
                });

                if (availableSpecial.length > 0) {
                    sortDoctors(availableSpecial, isHoliday);
                    chosenSpecial = availableSpecial[0];
                    specialRole = doctorRoles[chosenSpecial] || 'Default';
                }
            }

            for (let i = 0; i < slotsPerDay; i++) {
                const reqRole = daySlotsList[i];
                if (chosenSpecial && specialRole === reqRole && !specialDoctorAssigned) {
                    selected.push(chosenSpecial);
                    chosenToday.push(chosenSpecial);
                    specialDoctorAssigned = true;
                    if (roleBased && allowBlankDays && remainingRoleSlots[reqRole] !== undefined) {
                        remainingRoleSlots[reqRole]--;
                        remainingRoleQuotas[reqRole]--;
                    }
                } else {
                    // 2. Strict Role Isolation
                    const baseRoleDocs = roleBased ? doctors.filter(doc => (doctorRoles[doc] || 'Default') === reqRole) : doctors;
                    const roleDocs = baseRoleDocs.filter(doc => {
                        // 1. Hard Quota Ceiling
                        if (roleBased && roleQuotas[doctorRoles[doc] || 'Default']) {
                            const quota = roleQuotas[doctorRoles[doc] || 'Default'];
                            if (tCounts[doc] >= quota) return false;
                        }
                        return true;
                    });
                    let availableDocs = [];

                    // Cascade Level 1: Strict Constraints (Ideal Case)
                    availableDocs = roleDocs.filter(doc => {
                        if (chosenToday.includes(doc)) return false;
                        if (offToday.has(doc) || offTomorrow.has(doc)) return false;
                        const yesterdayDocs = scheduleMap[day - 1] || [];
                        if (isHoliday && holidaySet.has(day - 1) && yesterdayDocs.includes(doc)) return false;
                        if (preventConsecutiveAll && day > 1 && yesterdayDocs.includes(doc)) return false;
                        if (chosenToday.some(otherDoc => areConflicting(doc, otherDoc))) return false;
                        if (chosenSpecial && specialDocs.includes(doc) && doc !== chosenSpecial) return false;
                        return true;
                    });

                    // Must-Fill cascade: only runs when Allow Blank Days is OFF
                    if (availableDocs.length === 0 && !allowBlankDays) {
                        // Cascade Level 2: Relax spacing / consecutive rules
                        availableDocs = roleDocs.filter(doc => {
                            if (chosenToday.includes(doc)) return false;
                            if (offToday.has(doc) || offTomorrow.has(doc)) return false;
                            if (chosenToday.some(otherDoc => areConflicting(doc, otherDoc))) return false;
                            if (chosenSpecial && specialDocs.includes(doc) && doc !== chosenSpecial) return false;
                            return true;
                        });
                    }

                    if (availableDocs.length === 0 && !allowBlankDays) {
                        // Cascade Level 3: Relax conflict rules
                        availableDocs = roleDocs.filter(doc => {
                            if (chosenToday.includes(doc)) return false;
                            if (offToday.has(doc) || offTomorrow.has(doc)) return false;
                            if (chosenSpecial && specialDocs.includes(doc) && doc !== chosenSpecial) return false;
                            return true;
                        });
                    }

                    if (availableDocs.length === 0 && !allowBlankDays) {
                        // Cascade Level 4: Relax Off Requests
                        availableDocs = roleDocs.filter(doc => {
                            if (chosenToday.includes(doc)) return false;
                            if (offToday.has(doc)) return false;
                            if (chosenSpecial && specialDocs.includes(doc) && doc !== chosenSpecial) return false;
                            return true;
                        });
                    }

                    if (availableDocs.length === 0 && !allowBlankDays) {
                        // Cascade Level 5: Absolute fallback (Any doctor with matching role, but not already working today)
                        availableDocs = roleDocs.filter(doc => !chosenToday.includes(doc) && !offToday.has(doc));
                    }

                    // Final assignment
                    if (availableDocs.length > 0) {
                        // Probabilistically leave it blank to balance shortages across the month
                        if (roleBased && allowBlankDays && remainingRoleSlots[reqRole] !== undefined) {
                            const slotsLeft = remainingRoleSlots[reqRole];
                            const quotaLeft = remainingRoleQuotas[reqRole] || 0;
                            if (slotsLeft > quotaLeft && quotaLeft > 0 && randomness > 0) {
                                const blankProb = (slotsLeft - quotaLeft) / slotsLeft;
                                if (Math.random() < (blankProb * (0.8 + Math.random() * 0.4))) {
                                    availableDocs = []; // Force blank
                                }
                            }
                        }
                    }

                    if (availableDocs.length > 0) {
                        sortDoctors(availableDocs, isHoliday);
                        const chosenDoc = availableDocs[0];
                        selected.push(chosenDoc);
                        chosenToday.push(chosenDoc);
                        if (roleBased && allowBlankDays && remainingRoleSlots[reqRole] !== undefined) {
                            remainingRoleSlots[reqRole]--;
                            remainingRoleQuotas[reqRole]--;
                        }
                    } else if (baseRoleDocs.length === 0 && !allowBlankDays) {
                        // Critical Coverage Error: no doctors mapped to this role at all
                        throw new Error(`Critical Coverage Error: Day ${day} cannot be covered for role "${reqRole}". There are no doctors mapped to this role.`);
                    } else {
                        // Blank day / shortage marker
                        selected.push(SHORTAGE_MARKER);
                        if (roleBased && allowBlankDays && remainingRoleSlots[reqRole] !== undefined) {
                            remainingRoleSlots[reqRole]--;
                        }
                    }
                }
            }

            selected.forEach(doc => {
                if (doctors.includes(doc)) {
                    if (isHoliday) hCounts[doc]++; else wCounts[doc]++;
                    tCounts[doc]++;
                    lastShift[doc] = day;
                }
            });

            scheduleMap[day] = selected;
        }

        // Temporary note object that will be fully translated later
        let tempDayRow = {
            day,
            dayName: "",
            isHoliday,
            isSpecial: specialHols.includes(day),
            isNoDuty,
            slots: slotsPerDay,
            selectedDocs: selected.map((doc, idx) => ({
                name: doc,
                role: (doc === SHORTAGE_MARKER || doc === "-") ? "Default" : (daySlotsList[idx] || 'Default')
            })),
            note: ""
        };

        if (formatUI) {
            const dateObj = new Date(calcYear, month - 1, day);
            const thDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
            const enDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            tempDayRow.dayName = currentLang === 'th' ? thDays[dateObj.getDay()] : enDays[dateObj.getDay()];
            updateDayNote(tempDayRow, offToday);
        }

        scheduleData.push(tempDayRow);
    }

    const summaryData = doctors.map(doc => ({
        name: doc,
        workdays: wCounts[doc] || 0,
        holidays: hCounts[doc] || 0,
        total: tCounts[doc] || 0
    }));

    return { schedule: scheduleData, summary: summaryData, wCounts, hCounts, tCounts, maxSlots: maxSlotsFound };
}

// Scoring algorithm evaluating candidate quality
// Higher scores represent better fairness, spacing, and fewer shortages
function scoreSchedule(candidate) {
    let score = 0;
    const activeDocsCount = doctors.length;
    if (activeDocsCount === 0) return 0;

    // 1. Heavy penalty for shortages (SHORTAGE_MARKER)
    let shortages = 0;
    candidate.schedule.forEach(day => {
        day.selectedDocs.forEach(docObj => {
            if (docObj.name === SHORTAGE_MARKER) shortages++;
        });
    });
    score -= shortages * 15000;

    // 2. Workload balance (Standard Deviation)
    const totals = Object.values(candidate.tCounts);
    const holidays = Object.values(candidate.hCounts);
    const workdays = Object.values(candidate.wCounts);

    const avgTotal = totals.reduce((a, b) => a + b, 0) / activeDocsCount;
    const avgHol = holidays.reduce((a, b) => a + b, 0) / activeDocsCount;
    const avgWork = workdays.reduce((a, b) => a + b, 0) / activeDocsCount;

    const stdDevTotal = Math.sqrt(totals.reduce((sum, val) => sum + Math.pow(val - avgTotal, 2), 0) / activeDocsCount);
    const stdDevHol = Math.sqrt(holidays.reduce((sum, val) => sum + Math.pow(val - avgHol, 2), 0) / activeDocsCount);
    const stdDevWork = Math.sqrt(workdays.reduce((sum, val) => sum + Math.pow(val - avgWork, 2), 0) / activeDocsCount);

    // Penalize high standard deviations
    score -= stdDevTotal * 600;
    score -= stdDevHol * 1200; // Holiday duties are precious, prioritize strict balance
    score -= stdDevWork * 300;

    // 3. Gap distribution: penalize short gaps (working with 1 day off in between)
    doctors.forEach(doc => {
        let dutyDays = [];
        candidate.schedule.forEach(day => {
            if (day.selectedDocs.some(d => d.name === doc)) {
                dutyDays.push(day.day);
            }
        });

        for (let i = 1; i < dutyDays.length; i++) {
            let gap = dutyDays[i] - dutyDays[i - 1];
            if (gap === 2) {
                score -= 60; // slight penalty for 1 day rest spacing
            }
        }
    });

    return score;
}

let isCalculating = false;
window.generateSchedule = async function () {
    if (isCalculating) return;

    const btn = document.getElementById('btnCalculate');
    let originalHtml = "";
    if (btn) originalHtml = btn.innerHTML;

    try {
        if (doctors.length < 2) {
            document.getElementById('resultsContainer').classList.add('hidden');
            document.getElementById('emptyState').classList.remove('hidden');
            if (!isInitialLoad) showToast(translations[currentLang].emptyStateDesc, true);
            isInitialLoad = false;
            return;
        }

        // Custom Date Range Validation & Dates Population
        if (isCustomDateRange) {
            const startStr = document.getElementById('inputStartDate').value;
            const endStr = document.getElementById('inputEndDate').value;
            if (!startStr || !endStr) {
                if (btn) btn.innerHTML = originalHtml;
                isCalculating = false;
                showToast(currentLang === 'th' ? "กรุณาระบุวันที่เริ่มต้นและสิ้นสุด" : "Please select start and end dates", true);
                return;
            }
            const sd = new Date(startStr);
            const ed = new Date(endStr);
            if (sd >= ed) {
                if (btn) btn.innerHTML = originalHtml;
                isCalculating = false;
                showToast(currentLang === 'th' ? "วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด" : "Start date must be before end date", true);
                return;
            }
            const diffDays = Math.round((ed - sd) / (1000 * 60 * 60 * 24)) + 1;
            if (diffDays > 90) {
                if (btn) btn.innerHTML = originalHtml;
                isCalculating = false;
                showToast(currentLang === 'th' ? "ช่วงวันที่เกิน 90 วัน กรุณาตรวจสอบ" : "Range exceeds 90 days, please check", true);
                return;
            }

            scheduleDates = [];
            let curr = new Date(sd);
            while (curr <= ed) {
                scheduleDates.push(new Date(curr));
                curr.setDate(curr.getDate() + 1);
            }
        } else {
            const year = parseInt(document.getElementById('inputYear').value);
            const month = parseInt(document.getElementById('inputMonth').value);
            const calcYear = year > 2500 ? year - 543 : year;
            const daysInMonth = new Date(calcYear, month, 0).getDate();
            scheduleDates = [];
            for (let i = 1; i <= daysInMonth; i++) {
                scheduleDates.push(new Date(calcYear, month - 1, i));
            }
        }

        isInitialLoad = false;
        isCalculating = true;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> <span>${currentLang === 'th' ? 'กำลังจัดตาราง...' : 'Calculating...'}</span>`;
            lucide.createIcons();
        }

        // Show a loading toast before the loop starts
        showToast(currentLang === 'th' ? "กำลังจัดตารางเวร..." : "Calculating schedule...");

        // Yield to allow browser to render the disabled state, loader spinner, and toast
        await new Promise(resolve => setTimeout(resolve, 50));

        // Run smart solver search: generate multiple schedules and pick the highest scoring one
        let bestCandidate = null;
        let bestScore = -Infinity;

        // Parse config ONCE for all candidates
        const config = parseUIConfig();

        // 1. Run baseline greedy (0 randomness)
        const baseline = generateSingleScheduleCandidate(0, false, config);
        bestCandidate = baseline;
        bestScore = scoreSchedule(baseline);

        // 2. Search alternative spaces via randomized greedy trials (300 iterations)
        const iterations = 300;
        const batchSize = 30; // Break the 300 iterations into 10 chunks of 30

        for (let i = 0; i < iterations; i += batchSize) {
            for (let j = 0; j < batchSize && (i + j) < iterations; j++) {
                const candidate = generateSingleScheduleCandidate(0.85, false, config);
                const score = scoreSchedule(candidate);
                if (score > bestScore) {
                    bestScore = score;
                    bestCandidate = candidate;
                }
            }
            // Yield control back to the main thread unconditionally after each chunk
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        // 3. Fail-Safe Verification:
        // Check if the constraints are mathematically impossible (e.g. if the best schedule found consists entirely of shortages)
        let totalSlots = 0;
        let shortages = 0;
        bestCandidate.schedule.forEach(day => {
            day.selectedDocs.forEach(docObj => {
                totalSlots++;
                if (docObj.name === SHORTAGE_MARKER) shortages++;
            });
        });

        if (shortages === totalSlots && totalSlots > 0) {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
                lucide.createIcons();
            }
            isCalculating = false;
            const errorMsg = currentLang === 'th'
                ? "ระบบจัดตารางล้มเหลว: เงื่อนไขการจัดเวรขัดแย้งกันเกินไปจนเป็นไปไม่ได้ กรุณาลดข้อจำกัดลง"
                : "Scheduling failed: Conflict constraints make the schedule impossible. Please reduce restrictions.";
            showToast(errorMsg, true);
            return;
        }

        // 4. Finalize the UI properties for the chosen best candidate (called only once!)
        const year = parseInt(document.getElementById('inputYear').value);
        const month = parseInt(document.getElementById('inputMonth').value);
        const calcYear = year > 2500 ? year - 543 : year;
        const thDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
        const enDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        bestCandidate.schedule.forEach(row => {
            const dateObj = isCustomDateRange ? scheduleDates[row.day - 1] : new Date(calcYear, month - 1, row.day);
            row.dayName = currentLang === 'th' ? thDays[dateObj.getDay()] : enDays[dateObj.getDay()];
            
            if (isCustomDateRange) {
                const dd = String(dateObj.getDate()).padStart(2, '0');
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const yyyy = currentLang === 'th' ? dateObj.getFullYear() + 543 : dateObj.getFullYear();
                row.dayDisplay = `${dd}/${mm}/${yyyy}`;
            }

            updateDayNote(row, null, config);
        });

        globalResult = {
            schedule: JSON.parse(JSON.stringify(bestCandidate.schedule)),
            originalSchedule: JSON.parse(JSON.stringify(bestCandidate.schedule)),
            summary: bestCandidate.summary,
            month,
            year,
            maxSlots: bestCandidate.maxSlots
        };

        // Apply manual overrides saved previously
        applyManualOverrides(config);

        renderResults();
        updateStatsDashboard();

        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            lucide.createIcons();
        }
        isCalculating = false;

        if (shortages > 0) {
            showToast(currentLang === 'th' ? "จัดตารางเวรเสร็จสิ้น แต่บางเวรขาดคนเนื่องจากเงื่อนไขโควตาแบบเป๊ะขัดแย้งกัน" : "Schedule completed, but some slots could not be filled strictly due to constraint conflicts.", true);
        } else {
            showToast(currentLang === 'th' ? "จัดตารางเวรด้วย Smart Solver สำเร็จ!" : "Schedule calculated successfully with Smart Solver!");
        }

    } catch (error) {
        console.error(error);
        const btn = document.getElementById('btnCalculate');
        if (btn && originalHtml) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            lucide.createIcons();
        }
        isCalculating = false;

        if (error.message && error.message.includes("Critical Coverage Error")) {
            showToast(error.message, true);
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.classList.remove('hidden');
                const titleEl = emptyState.querySelector('[data-i18n="emptyStateTitle"]') || emptyState.querySelector('h3');
                const descEl = emptyState.querySelector('[data-i18n="emptyStateDesc"]') || emptyState.querySelector('p');
                if (titleEl) titleEl.innerText = currentLang === 'th' ? "ข้อผิดพลาดร้ายแรงเกี่ยวกับการครอบคลุมเวร" : "Critical Coverage Error";
                if (descEl) descEl.innerText = error.message;
            }
            document.getElementById('resultsContainer')?.classList.add('hidden');
        } else {
            showToast(currentLang === 'th' ? "เกิดข้อผิดพลาดในการคำนวณ" : "Error calculating schedule", true);
        }
    }
};

// Apply manual edits to the current global result
function applyManualOverrides(config = null) {
    if (!globalResult) return;
    if (!config) config = parseUIConfig();

    Object.keys(manualOverrides).forEach(dayStr => {
        const day = parseInt(dayStr);
        const dayRow = globalResult.schedule[day - 1];
        if (dayRow && !dayRow.isNoDuty) {
            Object.keys(manualOverrides[day]).forEach(slotStr => {
                const slotIndex = parseInt(slotStr);
                if (slotIndex < dayRow.slots) {
                    dayRow.selectedDocs[slotIndex] = {
                        name: manualOverrides[day][slotIndex],
                        role: dayRow.selectedDocs[slotIndex]?.role || 'Default'
                    };
                }
            });
            // Refresh notes for this overridden day
            updateDayNote(dayRow, null, config);
        }
    });

    // Recalculate summary totals based on overrides
    recalculateCounts(config);
}

// Toggle clear overrides
window.clearManualOverrides = function () {
    pushToUndoStack();
    manualOverrides = {};
    generateSchedule();
    showToast(currentLang === 'th' ? "คืนค่าเริ่มต้นจากระบบคำนวณทั้งหมดแล้ว" : "All manual overrides reset to auto");
};

// Recalculate summary metrics based on manual overrides
function recalculateCounts(config = null) {
    if (!globalResult) return;
    if (!config) config = parseUIConfig();

    const wCounts = {};
    const hCounts = {};
    const tCounts = {};
    doctors.forEach(doc => { wCounts[doc] = 0; hCounts[doc] = 0; tCounts[doc] = 0; });

    const { holidaySet } = config;

    globalResult.schedule.forEach(row => {
        if (row.isNoDuty) return;
        const isHoliday = holidaySet.has(row.day);
        row.selectedDocs.forEach(docObj => {
            const docName = docObj.name;
            if (doctors.includes(docName)) {
                if (isHoliday) {
                    hCounts[docName] = (hCounts[docName] || 0) + 1;
                } else {
                    wCounts[docName] = (wCounts[docName] || 0) + 1;
                }
                tCounts[docName] = (tCounts[docName] || 0) + 1;
            }
        });
    });

    globalResult.summary = doctors.map(doc => ({
        name: doc,
        workdays: wCounts[doc] || 0,
        holidays: hCounts[doc] || 0,
        total: tCounts[doc] || 0
    }));
}

// Dynamically update day warning notes on override change
function updateDayNote(dayRow, offTodayList = null, config = null) {
    const lang = currentLang;
    let noteStr = "";

    if (!config) config = parseUIConfig();
    const { roleBased, year, month, specialHols, doctorRoles, areConflicting, getRoleSlotsForDay } = config;
    const calcYear = year > 2500 ? year - 543 : year;

    // Build base note labels
    let baseNotes = [];
    if (specialHols.includes(dayRow.day)) {
        baseNotes.push(translations[lang].specialHolidayLabel);
    } else if (dayRow.isHoliday) {
        baseNotes.push(translations[lang].holidayLabel);
    }

    if (dayRow.isNoDuty) {
        baseNotes.push(translations[lang].noDutyNote);
    }

    noteStr = baseNotes.join(' / ');

    // Check for shortages
    const hasShortage = dayRow.selectedDocs.some(d => d.name === SHORTAGE_MARKER);
    if (hasShortage) {
        noteStr += (noteStr ? " / " : "") + translations[lang].shortageWarning;
    }

    // Check for Lock special rule
    const useSpecialRule = document.getElementById('chkUseSpecialRule').checked;
    const specialRuleDocsInput = document.getElementById('inputSpecialDocs').value;
    const specialDocs = specialRuleDocsInput.split(',').map(d => d.trim()).filter(d => d);
    const specialRuleDays = parseInt(document.getElementById('inputSpecialDays').value) || 0;

    if (useSpecialRule && dayRow.day <= specialRuleDays && specialDocs.length > 0) {
        const assignedSpecial = dayRow.selectedDocs.find(d => specialDocs.includes(d.name));
        if (assignedSpecial) {
            noteStr += (noteStr ? " / " : "") + translations[lang].lockedBadge.replace('{name}', assignedSpecial.name);
        }
    }

    // Gather off requests for this day
    let offToday = offTodayList;
    if (!offToday) {
        offToday = [];
        offData.forEach(req => {
            const d = parseInt(req.date);
            if (d === dayRow.day && req.names) {
                const namesArr = req.names.split(',').map(n => n.trim()).filter(n => n);
                offToday.push(...namesArr);
            }
        });
    }

    let offWarnings = [];
    dayRow.selectedDocs.forEach(docObj => {
        if (Array.from(offToday).includes(docObj.name)) {
            offWarnings.push(translations[lang].offWarning.replace('{name}', docObj.name));
        }
    });

    if (offWarnings.length > 0) {
        noteStr += (noteStr ? " / " : "") + offWarnings.join(' / ');
    }

    // Check for doctor conflicts on this day
    let dayConflicts = [];
    for (let i = 0; i < dayRow.selectedDocs.length; i++) {
        for (let j = i + 1; j < dayRow.selectedDocs.length; j++) {
            const doc1 = dayRow.selectedDocs[i].name;
            const doc2 = dayRow.selectedDocs[j].name;
            if (doctors.includes(doc1) && doctors.includes(doc2)) {
                if (areConflicting(doc1, doc2)) {
                    dayConflicts.push(`${doc1}-${doc2}`);
                }
            }
        }
    }
    if (dayConflicts.length > 0) {
        const warnMsg = lang === 'th' ? `⚠️ ขัดแย้ง: ${dayConflicts.join(', ')}` : `⚠️ Conflict: ${dayConflicts.join(', ')}`;
        noteStr += (noteStr ? " / " : "") + warnMsg;
    }

    // Check for role mismatch on this day
    let dayRoleSlots = getRoleSlotsForDay(dayRow.day);
    let daySlotsList = [];
    Object.keys(dayRoleSlots).forEach(role => {
        const count = dayRoleSlots[role];
        for (let i = 0; i < count; i++) {
            daySlotsList.push(role);
        }
    });

    let roleMismatches = [];
    const isRoleBased = document.getElementById('chkRoleBased')?.checked;
    if (isRoleBased) {
        for (let i = 0; i < dayRow.selectedDocs.length; i++) {
            const docObj = dayRow.selectedDocs[i];
            const docName = docObj.name;
            if (doctors.includes(docName)) {
                const docRole = doctorRoles[docName] || 'Default';
                const reqRole = docObj.role || 'Default';
                if (docRole !== reqRole && reqRole !== 'Default') {
                    roleMismatches.push(`${docName}(${docRole}แทน${reqRole})`);
                }
            }
        }
    }
    if (roleMismatches.length > 0) {
        const warnMsg = lang === 'th' ? `⚠️ ผิดบทบาท: ${roleMismatches.join(', ')}` : `⚠️ Role Mismatch: ${roleMismatches.join(', ')}`;
        noteStr += (noteStr ? " / " : "") + warnMsg;
    }

    dayRow.note = noteStr.trim();
}

function updateTargetedCellDOM(day, slotIndex) {
    if (!globalResult) return;

    const row = globalResult.schedule[day - 1];
    const docObj = row.selectedDocs[slotIndex];
    const docName = docObj ? docObj.name : "";
    const docRole = docObj ? docObj.role : "Default";

    // Calculate new styles
    let badgeClass = "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";
    let calBadgeClass = "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";

    if (docName === SHORTAGE_MARKER && !row.isNoDuty) {
        badgeClass = "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold";
        calBadgeClass = "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold animate-pulse";
    } else if (docName === "-" || docName === "" || row.isNoDuty) {
        badgeClass = "text-slate-300 dark:text-slate-600 bg-transparent border-dashed border-slate-200 dark:border-slate-800";
        calBadgeClass = badgeClass;
    } else if (doctors.includes(docName)) {
        const docIdx = doctors.indexOf(docName);
        const colors = [
            "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-400",
            "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400",
            "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400",
            "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400",
            "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400",
            "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-400",
            "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400"
        ];
        badgeClass = colors[docIdx % colors.length] + " font-bold";
        calBadgeClass = badgeClass;
    }

    let displayDoc = docName;
    const isRoleBasedEnabled = document.getElementById('chkRoleBased')?.checked;
    if (docName === SHORTAGE_MARKER) {
        displayDoc = translations[currentLang].shortageSlot;
    } else if (docName === "-" || docName === "") {
        displayDoc = translations[currentLang].emptySlot;
    } else if (doctors.includes(docName)) {
        displayDoc = (isRoleBasedEnabled && docRole !== 'Default') ? `${docName} (${docRole})` : docName;
    }

    // 1. Update Table View Button
    const btnTable = document.getElementById(`btn-day-${day}-slot-${slotIndex}`);
    if (btnTable) {
        btnTable.className = `w-full text-left text-xs px-2.5 py-1.5 rounded-lg ${badgeClass} flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm`;
        const span = btnTable.querySelector('span.truncate');
        if (span) span.innerText = displayDoc;
    }

    // 2. Update Calendar View Button
    const btnCal = document.getElementById(`btn-cal-day-${day}-slot-${slotIndex}`);
    if (btnCal) {
        btnCal.className = `w-full text-left text-[11px] px-2 py-1 rounded-lg ${calBadgeClass} flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm`;
        const span = btnCal.querySelector('span.truncate');
        if (span) span.innerText = displayDoc;
    }

    // 3. Rebuild Notes
    let noteHtmlTable = '';
    let noteHtmlCal = '';
    if (row.note) {
        let textClass = "font-medium text-slate-600 dark:text-slate-350";
        if (row.isNoDuty) textClass = "font-medium text-slate-400 dark:text-slate-550";
        else if (row.isSpecial) textClass = "font-medium text-orange-850 dark:text-orange-305";
        else if (row.isHoliday) textClass = "font-medium text-rose-800 dark:text-rose-300";

        const parts = row.note.split('/');
        noteHtmlTable = '<div class="flex flex-wrap gap-1.5">';

        parts.forEach(p => {
            const text = p.trim();
            if (!text) return;

            // Table
            let badgeClassTable = textClass && !row.isNoDuty ? 'bg-white/80 dark:bg-slate-800 border border-black/5 dark:border-slate-700 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
            if (text.includes(translations[currentLang].noDutyNote) || text.includes(translations[currentLang].noDutyBadge)) badgeClassTable = 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700';
            else if (text.startsWith("[ล็อคคิว") || text.startsWith("[Locked")) badgeClassTable = 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900';
            else if (text.includes(SHORTAGE_MARKER) || text.includes("Shortage")) badgeClassTable = 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 animate-pulse';
            else if (text.includes("ขอพัก") || text.includes("Off")) badgeClassTable = 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900';
            noteHtmlTable += `<span class="text-[11px] px-2.5 py-1 rounded-md font-semibold tracking-wide ${badgeClassTable}">${text}</span>`;

            // Calendar
            if (!row.isNoDuty && !text.includes("Off") && !text.includes("Shortage") && !text.includes("ขอพัก") && !text.includes(SHORTAGE_MARKER)) {
                let badgeStyleCal = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] px-1 py-0.5 rounded";
                if (text.startsWith("[ล็อคคิว") || text.startsWith("[Locked")) {
                    badgeStyleCal = "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-[8px] px-1 py-0.5 rounded font-bold";
                }
                noteHtmlCal += `<span class="${badgeStyleCal} truncate block max-w-full" title="${text}">${text}</span>`;
            }
        });
        noteHtmlTable += '</div>';
    }

    // 4. Update Note Cells
    const noteCellTable = document.getElementById(`note-day-${day}`);
    if (noteCellTable) noteCellTable.innerHTML = noteHtmlTable;

    const noteCellCal = document.getElementById(`note-cal-day-${day}`);
    if (noteCellCal) noteCellCal.innerHTML = noteHtmlCal;
}

// Apply a specific doctor change to a slot
// Apply a specific doctor change to a slot
window.updateDoctorAssignment = function (day, slotIndex, docIndex) {
    if (!globalResult) return;

    let newDoctor = "-";
    if (docIndex === -1) {
        newDoctor = SHORTAGE_MARKER;
    } else if (docIndex >= 0) {
        newDoctor = doctors[docIndex];
    }
    if (!newDoctor) return;

    // We only push to stack if this was not part of an internal bulk operation like drag-and-drop
    // Drag-and-drop handles its own stack pushing.
    if (!window.isDragAndDropOperation) pushToUndoStack();

    // Save to overrides tracker
    if (!manualOverrides[day]) manualOverrides[day] = {};
    manualOverrides[day][slotIndex] = newDoctor;

    // Update active state
    globalResult.schedule[day - 1].selectedDocs[slotIndex] = {
        name: newDoctor,
        role: globalResult.schedule[day - 1].selectedDocs[slotIndex]?.role || 'Default'
    };
    updateDayNote(globalResult.schedule[day - 1]);

    updateTargetedCellDOM(day, slotIndex);

    const btnConfirm = document.getElementById('btnConfirmChanges');
    if (btnConfirm) btnConfirm.classList.remove('hidden');

    showToast(currentLang === 'th' ? `อัปเดตเวรวันที่ ${day} สำเร็จ!` : `Day ${day} duty updated successfully!`);
    
    const config = parseUIConfig();
    explainSlotFailure(day, newDoctor, config);
};

// Explain why a manual swap might violate a constraint
window.explainSlotFailure = function(day, doc, config) {
    if(!doc || doc === SHORTAGE_MARKER || doc === '-' || !config) return;
    const { preventConsecutiveAll, offMap } = config;
    let reasons = [];
    
    if (offMap.has(`${doc}_${day}`)) {
        reasons.push(currentLang === 'th' ? `ขอพัก/ลาในวันนี้` : `requested off today`);
    }
    
    if (preventConsecutiveAll) {
        const yesterday = globalResult.schedule[day - 2];
        if (yesterday && yesterday.selectedDocs.some(s => s && s.name === doc)) {
            reasons.push(currentLang === 'th' ? `อยู่เวรติดกัน (เมื่อวาน)` : `worked yesterday`);
        }
        const tomorrow = globalResult.schedule[day];
        if (tomorrow && tomorrow.selectedDocs.some(s => s && s.name === doc)) {
            reasons.push(currentLang === 'th' ? `อยู่เวรติดกัน (พรุ่งนี้)` : `working tomorrow`);
        }
    }
    
    const dayRow = globalResult.schedule[day - 1];
    let slotsInDay = 0;
    if (dayRow) {
        dayRow.selectedDocs.forEach(s => { if (s && s.name === doc) slotsInDay++; });
        if (slotsInDay > 1) reasons.push(currentLang === 'th' ? `ถูกจัดเวรซ้ำซ้อนในวันนี้` : `assigned multiple times today`);
    }

    if (reasons.length > 0) {
        showToast(`⚠️ ${currentLang === 'th' ? 'ข้อควรระวัง: ' : 'Warning: '}${doc} ${reasons.join(', ')}`, true);
    }
};

// Reset overridden cell back to algorithm calculated value
window.resetSlotToAuto = function (day, slotIndex) {
    pushToUndoStack();
    if (manualOverrides[day]) {
        delete manualOverrides[day][slotIndex];
        if (Object.keys(manualOverrides[day]).length === 0) {
            delete manualOverrides[day];
        }
    }

    if (globalResult && globalResult.originalSchedule) {
        const autoDoc = globalResult.originalSchedule[day - 1].selectedDocs[slotIndex];
        globalResult.schedule[day - 1].selectedDocs[slotIndex] = {
            name: autoDoc ? autoDoc.name : "",
            role: autoDoc ? autoDoc.role : "Default"
        };
        updateDayNote(globalResult.schedule[day - 1]);

        updateTargetedCellDOM(day, slotIndex);

        const btnConfirm = document.getElementById('btnConfirmChanges');
        if (btnConfirm) btnConfirm.classList.remove('hidden');
    }
    showToast(currentLang === 'th' ? `คืนค่าระบบคำนวณ วันที่ ${day} สำเร็จ!` : `Reset Day ${day} to automatic solver`);
};

window.confirmChanges = function () {
    if (!globalResult) return;
    const config = parseUIConfig();
    recalculateCounts(config);
    renderSummaryTable(config);
    updateStatsDashboard();

    const btnConfirm = document.getElementById('btnConfirmChanges');
    if (btnConfirm) btnConfirm.classList.add('hidden');

    showToast(currentLang === 'th' ? "อัปเดตสถิติเรียบร้อยแล้ว" : "Stats updated successfully");
};

// Stats Dashboard Rendering
function updateStatsDashboard() {
    if (!globalResult) return;

    let totalDuties = 0;
    let shortages = 0;

    globalResult.schedule.forEach(row => {
        if (row.isNoDuty) return;
        row.selectedDocs.forEach(docObj => {
            if (docObj.name === SHORTAGE_MARKER) {
                shortages++;
            } else if (docObj.name !== "-" && docObj.name !== "") {
                totalDuties++;
            }
        });
    });

    document.getElementById('statTotalDuties').innerText = `${totalDuties} ${currentLang === 'th' ? 'เวร' : 'duties'}`;

    const shortagesCard = document.getElementById('statShortagesCard');
    const shortagesIconBg = document.getElementById('statShortagesIconBg');
    const shortagesIcon = document.getElementById('statShortagesIcon');
    const shortagesText = document.getElementById('statShortages');

    shortagesText.innerText = `${shortages} ${currentLang === 'th' ? 'วัน' : 'days'}`;
    if (shortages > 0) {
        shortagesCard.className = "bg-red-50 border border-red-200 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-3 dark:bg-red-950/20 dark:border-red-900/40";
        shortagesIconBg.className = "bg-red-100 dark:bg-red-950/60 p-2.5 rounded-xl text-red-600 dark:text-red-400";
        shortagesIcon.setAttribute('data-lucide', 'alert-circle');
    } else {
        shortagesCard.className = "bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800";
        shortagesIconBg.className = "bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400";
        shortagesIcon.setAttribute('data-lucide', 'check-circle');
    }

    const activeDocCount = doctors.length;
    const avg = activeDocCount > 0 ? (totalDuties / activeDocCount).toFixed(1) : '0.0';
    document.getElementById('statAvgDuties').innerText = `${avg} ${currentLang === 'th' ? 'เวร/คน' : 'duties/doc'}`;

    if (globalResult.summary && globalResult.summary.length > 0) {
        const totals = globalResult.summary.map(s => s.total);
        const minVal = Math.min(...totals);
        const maxVal = Math.max(...totals);
        document.getElementById('statSpread').innerText = `Min: ${minVal} | Max: ${maxVal}`;
    } else {
        document.getElementById('statSpread').innerText = `Min: 0 | Max: 0`;
    }

    // Toggle visibility of clear manual overrides button
    const clearOverridesBtn = document.getElementById('btnClearOverrides');
    if (clearOverridesBtn) {
        if (Object.keys(manualOverrides).length > 0) {
            clearOverridesBtn.classList.remove('hidden');
        } else {
            clearOverridesBtn.classList.add('hidden');
        }
    }

    lucide.createIcons();
}

// Render Results Router (handles Table & Calendar view)
// Render only the Summary Table
function renderSummaryTable(config = null) {
    if (!globalResult) return;

    if (!config) config = parseUIConfig();
    const { doctorRoles, roleQuotas, roleBased } = config;

    // Draw summary section
    const sumBody = document.getElementById('summaryTableBody');
    if (!sumBody) return;
    sumBody.innerHTML = '';
    let totalShifts = 0;

    globalResult.summary.forEach(sum => {
        totalShifts += sum.total;
        const role = doctorRoles[sum.name] || 'Default';
        const displayName = role !== 'Default' && roleBased ? `${esc(sum.name)} (${esc(role)})` : esc(sum.name);

        let quotaIndicator = '';
        if (roleBased && roleQuotas[role] > 0) {
            if (sum.total >= roleQuotas[role]) {
                quotaIndicator = `<span class="ml-2 inline-flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-wider"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-0.5"><path d="M20 6 9 17l-5-5"/></svg>Quota</span>`;
            } else {
                quotaIndicator = `<span class="ml-2 inline-flex items-center text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded text-[10px] font-bold border border-orange-200 dark:border-orange-800/50 uppercase tracking-wider"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>${sum.total}/${roleQuotas[role]}</span>`;
            }
        }

        sumBody.innerHTML += `
            <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-6 text-left font-bold text-slate-700 dark:text-slate-200 flex items-center">${displayName}${quotaIndicator}</td>
                <td class="py-3 px-4 text-teal-600 dark:text-teal-400 font-bold bg-teal-50/30 dark:bg-teal-950/20">${sum.workdays}</td>
                <td class="py-3 px-4 text-orange-600 dark:text-orange-400 font-bold bg-orange-50/30 dark:bg-orange-950/20">${sum.holidays}</td>
                <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 bg-slate-200/50 dark:bg-slate-800/80 text-[15px]">${sum.total}</td>
            </tr>
        `;
    });

    const sumTotalCount = document.getElementById('sumTotalCount');
    if (sumTotalCount) sumTotalCount.innerText = totalShifts;
}

// Render Results Router (handles Table & Calendar view)
function renderResults() {
    if (!globalResult) return;

    const config = parseUIConfig();
    renderSummaryTable(config);

    if (viewMode === 'table') {
        renderTableView(config);
    } else if (viewMode === 'calendar') {
        renderCalendarView(config);
    } else if (viewMode === 'person') {
        renderPersonCentricView(config);
    }
}

// Render standard Table List View
function renderTableView(config) {
    const headerRow = document.getElementById('scheduleTableHeader');
    let headerHtml = `
        <tr class="text-slate-500 dark:text-slate-400 text-[13px] uppercase tracking-wider">
            <th class="py-3.5 px-6 border-b border-slate-200 dark:border-slate-800 font-bold w-16">${translations[currentLang].tableDateCol}</th>
            <th class="py-3.5 px-4 border-b border-slate-200 dark:border-slate-800 font-bold w-24">${translations[currentLang].tableDayCol}</th>
    `;
    for (let i = 1; i <= globalResult.maxSlots; i++) {
        headerHtml += `<th class="py-3.5 px-4 border-b border-slate-200 dark:border-slate-800 font-bold">${translations[currentLang].tableDutyCol} ${i}</th>`;
    }
    headerHtml += `<th class="py-3.5 px-6 border-b border-slate-200 dark:border-slate-800 font-bold">${translations[currentLang].tableNoteCol}</th></tr>`;
    headerRow.innerHTML = headerHtml;

    const schedBody = document.getElementById('scheduleTableBody');
    schedBody.innerHTML = '';

    globalResult.schedule.forEach(row => {
        let rowClass = "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors";
        let textClass = "font-medium text-slate-600 dark:text-slate-350";

        if (row.isNoDuty) {
            rowClass = "bg-slate-100 dark:bg-slate-850/30 opacity-70";
            textClass = "font-medium text-slate-400 dark:text-slate-550";
        } else if (row.isSpecial) {
            rowClass = "bg-orange-50/60 dark:bg-orange-950/20 hover:bg-orange-100/80 dark:hover:bg-orange-950/35";
            textClass = "font-medium text-orange-850 dark:text-orange-305";
        } else if (row.isHoliday) {
            rowClass = "bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-950/35";
            textClass = "font-medium text-rose-800 dark:text-rose-300";
        }

        let noteHtml = '';
        if (row.note) {
            const parts = row.note.split('/');
            noteHtml = '<div class="flex flex-wrap gap-1.5">';
            parts.forEach(p => {
                const text = p.trim();
                if (!text) return;
                let badgeClass = textClass && !row.isNoDuty ? 'bg-white/80 dark:bg-slate-800 border border-black/5 dark:border-slate-700 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
                if (text.includes(translations[currentLang].noDutyNote) || text.includes(translations[currentLang].noDutyBadge)) badgeClass = 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700';
                else if (text.startsWith("[ล็อคคิว") || text.startsWith("[Locked")) badgeClass = 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900';
                else if (text.includes(SHORTAGE_MARKER) || text.includes("Shortage")) badgeClass = 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 animate-pulse';
                else if (text.includes("ขอพัก") || text.includes("Off")) badgeClass = 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900';
                noteHtml += `<span class="text-[11px] px-2.5 py-1 rounded-md font-semibold tracking-wide ${badgeClass}">${text}</span>`;
            });
            noteHtml += '</div>';
        }

        let displayDay = row.dayDisplay || row.day;
        let colsHtml = `<td class="py-3.5 px-6 ${textClass}">${displayDay}</td><td class="py-3.5 px-4 ${textClass}">${row.dayName}</td>`;
        for (let i = 0; i < globalResult.maxSlots; i++) {
            let docObj = row.selectedDocs[i];
            let d = docObj ? docObj.name : "";
            let dRole = docObj ? docObj.role : "Default";
            let badgeClass = "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";

            if (d === SHORTAGE_MARKER && !row.isNoDuty) {
                badgeClass = "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold";
            } else if (d === "-" || d === "" || row.isNoDuty) {
                badgeClass = "text-slate-300 dark:text-slate-600 bg-transparent border-dashed border-slate-200 dark:border-slate-800";
            } else if (doctors.includes(d)) {
                const docIdx = doctors.indexOf(d);
                const colors = [
                    "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-400",
                    "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400",
                    "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400",
                    "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400",
                    "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400",
                    "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-400",
                    "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400"
                ];
                badgeClass = colors[docIdx % colors.length] + " font-bold";
            }

            let displayDoc = d;
            const isRoleBasedEnabled = document.getElementById('chkRoleBased')?.checked;
            if (d === SHORTAGE_MARKER) {
                displayDoc = translations[currentLang].shortageSlot;
            } else if (d === "-" || d === "") {
                displayDoc = translations[currentLang].emptySlot;
            } else if (doctors.includes(d)) {
                displayDoc = (isRoleBasedEnabled && dRole !== 'Default') ? `${esc(d)} (${esc(dRole)})` : esc(d);
            }

            if (row.isNoDuty) {
                colsHtml += `<td class="py-3.5 px-4 text-slate-300 dark:text-slate-700 font-medium">-</td>`;
            } else {
                colsHtml += `
                    <td class="py-3.5 px-4">
                        <div class="relative group/cell inline-block min-w-[110px]">
                            <button id="btn-day-${row.day}-slot-${i}" aria-label="Day ${row.day}, slot ${i + 1}. Current: ${displayDoc}. Click to change." onclick="openCellDropdown(event, 'tablecelldropdown-${row.day}-${i}')" class="w-full text-left text-xs px-2.5 py-1.5 rounded-lg ${badgeClass} flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm">
                                <span class="truncate" aria-hidden="true">${displayDoc}</span>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 opacity-0 group-hover/cell:opacity-60 transition-opacity"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                            <div id="tablecelldropdown-${row.day}-${i}" onclick="event.stopPropagation()" class="absolute left-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-20 py-1 hidden max-h-48 overflow-y-auto custom-scrollbar">
                                ${getCellDropdownOptionsHtml(row.day, i, d, config)}
                            </div>
                        </div>
                    </td>
                `;
            }
        }
        colsHtml += `<td id="note-day-${row.day}" class="py-3.5 px-6">${noteHtml}</td>`;
        schedBody.innerHTML += `<tr class="${rowClass}">${colsHtml}</tr>`;
    });
}

// Render Calendar Layout View
function renderCalendarView(config) {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const year = parseInt(document.getElementById('inputYear').value);
    const month = parseInt(document.getElementById('inputMonth').value);
    const calcYear = year > 2500 ? year - 543 : year;

    const firstDateObj = new Date(calcYear, month - 1, 1);
    const startDayOfWeek = firstDateObj.getDay();

    // Empty placeholder boxes for alignment offset
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = "hidden md:block bg-slate-100/40 dark:bg-slate-850/20 border border-slate-200/40 dark:border-slate-800 rounded-2xl min-h-[105px] opacity-40";
        grid.appendChild(emptyCell);
    }

    // Populate monthly days
    globalResult.schedule.forEach(dayRow => {
        const dayCell = document.createElement('div');

        let cardBg = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800";
        let dateNumClass = "text-slate-800 dark:text-slate-100 font-bold";

        if (dayRow.isNoDuty) {
            cardBg = "bg-slate-100 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-60";
            dateNumClass = "text-slate-400 dark:text-slate-600 font-bold";
        } else if (dayRow.isSpecial) {
            cardBg = "bg-orange-50/70 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-900/40";
            dateNumClass = "text-orange-700 dark:text-orange-400 font-bold";
        } else if (dayRow.isHoliday) {
            cardBg = "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40";
            dateNumClass = "text-rose-700 dark:text-rose-400 font-bold";
        }

        dayCell.className = `border rounded-2xl p-2.5 min-h-[110px] flex flex-col gap-1.5 transition-all hover:shadow-md ${cardBg}`;

        let displayDateNum = dayRow.day;
        let monthLabel = '';
        if (isCustomDateRange && scheduleDates && scheduleDates[dayRow.day - 1]) {
            const dateObj = scheduleDates[dayRow.day - 1];
            displayDateNum = dateObj.getDate();
            if (displayDateNum === 1 || dayRow.day === 1) {
                const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthNamesTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                const mName = currentLang === 'th' ? monthNamesTh[dateObj.getMonth()] : monthNamesEn[dateObj.getMonth()];
                monthLabel = ` ${mName}`;
            }
        }

        let dayHeaderHtml = `
            <div class="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-1">
                <span class="text-sm ${dateNumClass}">${displayDateNum}${monthLabel}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-550 font-bold">${dayRow.dayName.substring(0, 3)}</span>
            </div>
        `;

        let docsHtml = '<div class="flex flex-col gap-1 flex-1 justify-start pt-0.5">';
        if (dayRow.isNoDuty) {
            docsHtml += `<span class="text-[10px] text-center font-bold text-slate-400 dark:text-slate-500 py-1.5 bg-slate-200/30 dark:bg-slate-800/40 rounded-lg">${translations[currentLang].noDutyBadge}</span>`;
        } else {
            for (let i = 0; i < dayRow.slots; i++) {
                const docObj = dayRow.selectedDocs[i];
                const doc = docObj ? docObj.name : "";
                const dRole = docObj ? docObj.role : "Default";
                let badgeClass = "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";
                if (doc === SHORTAGE_MARKER) {
                    badgeClass = "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold animate-pulse";
                } else if (doc === "-" || doc === "") {
                    badgeClass = "text-slate-300 dark:text-slate-600 bg-transparent border-dashed border-slate-200 dark:border-slate-800";
                } else if (doctors.includes(doc)) {
                    const docIdx = doctors.indexOf(doc);
                    const colors = [
                        "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-400",
                        "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400",
                        "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400",
                        "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400",
                        "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400",
                        "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-400",
                        "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400"
                    ];
                    badgeClass = colors[docIdx % colors.length] + " font-bold";
                }

                let displayDoc = doc;
                const isRoleBasedEnabled = document.getElementById('chkRoleBased')?.checked;
                let docIndexToPass = -2;
                if (doc === SHORTAGE_MARKER) {
                    displayDoc = translations[currentLang].shortageSlot;
                    docIndexToPass = -1;
                } else if (doc === "-" || doc === "") {
                    displayDoc = translations[currentLang].emptySlot;
                } else if (doctors.includes(doc)) {
                    displayDoc = (isRoleBasedEnabled && dRole !== 'Default') ? `${esc(doc)} (${esc(dRole)})` : esc(doc);
                    docIndexToPass = doctors.indexOf(doc);
                }

                docsHtml += `
                    <div class="relative group/cell">
                        <button id="btn-cal-day-${dayRow.day}-slot-${i}" aria-label="Day ${dayRow.day}, slot ${i + 1}. Current: ${displayDoc}. Click to change." 
                            draggable="true" ondragstart="handleDragStart(event, ${dayRow.day}, ${i}, ${docIndexToPass})" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${dayRow.day}, ${i}, ${docIndexToPass})"
                            onclick="openCellDropdown(event, 'celldropdown-${dayRow.day}-${i}')" class="w-full text-left text-[11px] px-2 py-1 rounded-lg ${badgeClass} flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm cursor-grab active:cursor-grabbing">
                            <span class="truncate" aria-hidden="true">${displayDoc}</span>
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-2.5 h-2.5 opacity-0 group-hover/cell:opacity-60 transition-opacity"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div id="celldropdown-${dayRow.day}-${i}" onclick="event.stopPropagation()" class="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 hidden max-h-48 overflow-y-auto custom-scrollbar">
                            ${getCellDropdownOptionsHtml(dayRow.day, i, doc, config)}
                        </div>
                    </div>
                `;
            }
        }
        docsHtml += '</div>';

        let noteHtml = '';
        if (dayRow.note && !dayRow.isNoDuty) {
            const parts = dayRow.note.split('/');
            parts.forEach(p => {
                const text = p.trim();
                if (!text || text.includes("Off") || text.includes("Shortage") || text.includes("ขอพัก") || text.includes(SHORTAGE_MARKER)) return; // Skip lengthy notes in calendar view grid

                let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] px-1 py-0.5 rounded";
                if (text.startsWith("[ล็อคคิว") || text.startsWith("[Locked")) {
                    badgeStyle = "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-[8px] px-1 py-0.5 rounded font-bold";
                }
                noteHtml += `<span class="${badgeStyle} truncate block max-w-full" title="${text}">${text}</span>`;
            });
        }

        dayCell.innerHTML = `
            ${dayHeaderHtml}
            ${docsHtml}
            <div id="note-cal-day-${dayRow.day}" class="mt-1 flex flex-col gap-0.5">${noteHtml}</div>
        `;

        grid.appendChild(dayCell);
    });
}

// Cell Dropdown content builder for custom updates
function getCellDropdownOptionsHtml(day, slotIndex, currentDoc, config = null, isMobile = false) {
    let optionsHtml = '';

    if (!config) config = parseUIConfig();
    const { doctorRoles } = config;

    // Show "Reset to Auto" option if cell has a manual override applied
    const isOverridden = manualOverrides[day] && manualOverrides[day][slotIndex] !== undefined;
    const btnClassBase = isMobile ? 'w-full text-left px-4 py-3 min-h-[48px] text-base' : 'w-full text-left px-3 py-1.5 text-xs';
    
    if (isOverridden) {
        optionsHtml += `
            <button onclick="resetSlotToAuto(${day}, ${slotIndex})" class="${btnClassBase} bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-950/50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> <span>${translations[currentLang].resetCellBtn || 'คืนค่าระบบคำนวณ'}</span>
            </button>
        `;
    }

    doctors.forEach((doc, index) => {
        const isCurrent = doc === currentDoc ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 font-bold border-l-4 border-teal-500' : 'text-slate-700 dark:text-slate-300 font-medium';
        const role = doctorRoles[doc] || 'Default';
        const displayName = role !== 'Default' ? `${doc} (${role})` : doc;
        optionsHtml += `
            <button onclick="updateDoctorAssignment(${day}, ${slotIndex}, ${index}); ${isMobile ? 'closeMobileModal();' : ''}" class="${btnClassBase} hover:bg-slate-100 dark:hover:bg-slate-800 ${isCurrent} border-b border-slate-100 dark:border-slate-800 last:border-0">
                ${esc(displayName)}
            </button>
        `;
    });

    const isShortage = currentDoc === SHORTAGE_MARKER ? 'bg-red-50 dark:bg-red-950/40 font-bold text-red-650 dark:text-red-400 border-l-4 border-red-500' : 'text-red-600 dark:text-red-400 font-bold';
    optionsHtml += `
        <div class="border-t-4 border-slate-100 dark:border-slate-800 my-1"></div>
        <button onclick="updateDoctorAssignment(${day}, ${slotIndex}, -1); ${isMobile ? 'closeMobileModal();' : ''}" class="${btnClassBase} hover:bg-red-50 dark:hover:bg-red-900/50 ${isShortage} border-b border-slate-100 dark:border-slate-800">
            ⚠️ <span>${translations[currentLang].shortageSlot || 'ขาดคน'}</span>
        </button>
    `;

    const isNone = currentDoc === "-" || currentDoc === "" ? 'bg-slate-50 dark:bg-slate-800 font-bold border-l-4 border-slate-400' : 'text-slate-400 dark:text-slate-500 font-bold';
    optionsHtml += `
        <button onclick="updateDoctorAssignment(${day}, ${slotIndex}, -2); ${isMobile ? 'closeMobileModal();' : ''}" class="${btnClassBase} hover:bg-slate-100 dark:hover:bg-slate-800 ${isNone}">
            <span>${translations[currentLang].emptySlot || '- ว่าง'}</span>
        </button>
    `;

    return optionsHtml;
}

window.closeMobileSheet = function() {
    const sheet = document.getElementById('mobileDoctorSheet');
    if (sheet) sheet.classList.add('hidden');
}

// Keep closeMobileModal in case it's called anywhere else by accident
window.closeMobileModal = function() {
    window.closeMobileSheet();
}

// Cell Dropdown Router Trigger
window.openCellDropdown = function (event, dropdownId) {
    event.stopPropagation();

    // Close other dropdown instances
    const dropdowns = document.querySelectorAll('[id^="dropdown-"]');
    dropdowns.forEach(d => d.classList.add('hidden'));

    const cellDropdowns = document.querySelectorAll('[id^="celldropdown-"], [id^="tablecelldropdown-"]');
    cellDropdowns.forEach(d => {
        if (d.id !== dropdownId) d.classList.add('hidden');
    });

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        const parts = dropdownId.split('-');
        const slotIndex = parseInt(parts.pop());
        const day = parseInt(parts.pop());
        
        let currentDoc = "";
        if (globalResult && globalResult.schedule) {
            const row = globalResult.schedule.find(r => r.day === day);
            if (row && row.selectedDocs && row.selectedDocs[slotIndex]) {
                currentDoc = row.selectedDocs[slotIndex].name;
            }
        }

        const listContainer = document.getElementById('mobileDoctorList');
        if (!listContainer) return;

        let optionsHtml = '';
        const config = parseUIConfig();
        const { doctorRoles } = config;
        
        const isOverridden = manualOverrides[day] && manualOverrides[day][slotIndex] !== undefined;
        if (isOverridden) {
            optionsHtml += `<button onclick="resetSlotToAuto(${day}, ${slotIndex}); closeMobileSheet();" class="w-full min-h-[48px] py-3 text-lg border-b border-slate-100 dark:border-slate-800 text-left text-indigo-600 dark:text-indigo-400 font-bold transition-colors">คืนค่าระบบคำนวณ</button>`;
        }

        doctors.forEach((doc, index) => {
            const isCurrent = doc === currentDoc ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300';
            const role = doctorRoles[doc] || 'Default';
            const displayName = role !== 'Default' ? `${doc} (${role})` : doc;
            optionsHtml += `<button onclick="updateDoctorAssignment(${day}, ${slotIndex}, ${index}); closeMobileSheet();" class="w-full min-h-[48px] py-3 text-lg border-b border-slate-100 dark:border-slate-800 text-left ${isCurrent} transition-colors">${esc(displayName)}</button>`;
        });
        
        optionsHtml += `<button onclick="updateDoctorAssignment(${day}, ${slotIndex}, -1); closeMobileSheet();" class="w-full min-h-[48px] py-3 text-lg border-b border-slate-100 dark:border-slate-800 text-left text-red-600 dark:text-red-400 font-bold transition-colors">⚠️ ขาดคน</button>`;
        optionsHtml += `<button onclick="updateDoctorAssignment(${day}, ${slotIndex}, -2); closeMobileSheet();" class="w-full min-h-[48px] py-3 text-lg border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 dark:text-slate-500 font-bold transition-colors">- ว่าง</button>`;

        listContainer.innerHTML = optionsHtml;
        document.getElementById('mobileDoctorSheet').classList.remove('hidden');

    } else {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
};

// Clipboard Copy functions
function formatShortDate(dayIndex, month, year, lang) {
    if (isCustomDateRange && scheduleDates && scheduleDates[dayIndex - 1]) {
        const dateObj = scheduleDates[dayIndex - 1];
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = lang === 'th' ? dateObj.getFullYear() + 543 : dateObj.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    const dd = String(dayIndex).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    let y = parseInt(year);
    if (lang === 'th') {
        if (y < 2500) y += 543;
    } else {
        if (y > 2500) y -= 543;
    }
    return `${dd}/${mm}/${y}`;
}

window.copyScheduleForExcel = function () {
    if (!globalResult || globalResult.schedule.length === 0) {
        showToast(currentLang === 'th' ? "ยังไม่มีข้อมูลตารางเวร" : "No schedule data available", true);
        return;
    }

    let tsvData = currentLang === 'th' ? "วันที่\tวัน\t" : "Date\tDay\t";
    for (let i = 1; i <= globalResult.maxSlots; i++) {
        tsvData += (currentLang === 'th' ? `เวรคนที่ ${i}\t` : `Duty ${i}\t`);
    }
    tsvData += (currentLang === 'th' ? "หมายเหตุ\n" : "Notes\n");

    globalResult.schedule.forEach(row => {
        const shortDate = formatShortDate(row.day, globalResult.month, globalResult.year, currentLang);
        tsvData += `${shortDate}\t${row.dayName}\t`;
        for (let i = 0; i < globalResult.maxSlots; i++) {
            let docObj = row.selectedDocs[i];
            let doc = docObj ? docObj.name : "";
            const isRoleBasedEnabled = document.getElementById('chkRoleBased')?.checked;
            if (doc === SHORTAGE_MARKER) {
                doc = "";
            } else if (doc === "-" || doc === "") {
                doc = "";
            } else if (doctors.includes(doc)) {
                if (isRoleBasedEnabled && docObj && docObj.role !== 'Default') doc = `${doc} (${docObj.role})`;
            }
            tsvData += `${doc}\t`;
        }
        tsvData += `${row.note}\n`;
    });

    navigator.clipboard.writeText(tsvData).then(() => {
        showToast(translations[currentLang].copyExcelBtn + " copy success!");
    }).catch(() => {
        showToast(currentLang === 'th' ? "เกิดข้อผิดพลาดในการคัดลอก" : "Copy failed", true);
    });
};

window.copySummary = function () {
    if (!globalResult) return;
    let text = currentLang === 'th' ?
        `📊 สรุปจำนวนเวร เดือน ${globalResult.month}/${globalResult.year}\n---------------------------------\nชื่อ      | ทำการ | วันหยุด | รวม\n---------------------------------\n` :
        `📊 On-call Summary Month ${globalResult.month}/${globalResult.year}\n---------------------------------\nName     | Weekdays | Holidays | Total\n---------------------------------\n`;

    let totalShifts = 0;
    globalResult.summary.forEach(s => {
        let name = s.name.padEnd(8, ' ');
        let w = String(s.workdays).padStart(3, ' ');
        let h = String(s.holidays).padStart(3, ' ');
        let t = String(s.total).padStart(3, ' ');
        text += `${name} | ${w}  |  ${h}  | ${t}\n`;
        totalShifts += s.total;
    });
    text += `---------------------------------\n${currentLang === 'th' ? 'รวมทั้งหมด' : 'Total shifts'}: ${totalShifts} ${translations[currentLang].shiftsUnit}\n`;

    navigator.clipboard.writeText(text).then(() => {
        showToast(translations[currentLang].copySummaryBtn + " copy success!");
    }).catch(() => {
        showToast(currentLang === 'th' ? "เกิดข้อผิดพลาดในการคัดลอก" : "Copy failed", true);
    });
};

// Excel Export File function
window.exportToExcel = function () {
    if (!window.XLSX || !globalResult) return;
    try {
        const headers = [translations[currentLang].tableDateCol, translations[currentLang].tableDayCol];
        for (let i = 1; i <= globalResult.maxSlots; i++) headers.push(`${translations[currentLang].tableDutyCol} ${i}`);
        headers.push(translations[currentLang].tableNoteCol);

        const data = [headers];
        globalResult.schedule.forEach(r => {
            const shortDate = formatShortDate(r.day, globalResult.month, globalResult.year, currentLang);
            let rowData = [shortDate, r.dayName];
            for (let i = 0; i < globalResult.maxSlots; i++) {
                let docObj = r.selectedDocs[i];
                let doc = docObj ? docObj.name : "";
                const isRoleBasedEnabled = document.getElementById('chkRoleBased')?.checked;
                if (doc === SHORTAGE_MARKER) {
                    doc = "";
                } else if (doc === "-" || doc === "") {
                    doc = "";
                } else if (doctors.includes(doc)) {
                    if (isRoleBasedEnabled && docObj && docObj.role !== 'Default') doc = `${doc} (${docObj.role})`;
                }
                rowData.push(doc);
            }
            rowData.push(r.note);
            data.push(rowData);
        });

        const ws = window.XLSX.utils.aoa_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, `Schedule Month ${globalResult.month}`);

        // Add Individual Duty Summary to a second sheet
        const summaryHeaders = currentLang === 'th' ? 
            ["ชื่อแพทย์", "เวรวันทำการ (จ-ศ)", "เวรวันหยุด (ส-อา, พิเศษ)", "รวมทั้งหมด"] : 
            ["Doctor Name", "Weekdays (Mon-Fri)", "Holidays (Sat-Sun, Special)", "Total Shifts"];
        const summaryData = [summaryHeaders];
        globalResult.summary.forEach(s => {
            summaryData.push([s.name, s.workdays, s.holidays, s.total]);
        });
        const summaryWs = window.XLSX.utils.aoa_to_sheet(summaryData);
        window.XLSX.utils.book_append_sheet(wb, summaryWs, currentLang === 'th' ? "สรุปจำนวนเวร" : "Summary");

        let displayYear = parseInt(globalResult.year);
        if (currentLang === 'th' && displayYear < 2500) displayYear += 543;
        if (currentLang === 'en' && displayYear > 2500) displayYear -= 543;

        window.XLSX.writeFile(wb, `OnCall_Month_${globalResult.month}_Year_${displayYear}.xlsx`);
        showToast(currentLang === 'th' ? "ดาวน์โหลดไฟล์ Excel สำเร็จ!" : "Excel file downloaded successfully!");
    } catch (e) {
        console.error(e);
        showToast(currentLang === 'th' ? "เกิดข้อผิดพลาดในการสร้างไฟล์ Excel" : "Error exporting Excel", true);
    }
};

window.isPendingCalc = false;
window.handleCustomDateRangeChange = async function() {
    if (!isCustomDateRange) return;
    const startStr = document.getElementById('inputStartDate').value;
    const endStr = document.getElementById('inputEndDate').value;
    if (startStr && endStr) {
        const sd = new Date(startStr);
        const ed = new Date(endStr);
        if (sd >= ed) {
            showToast(currentLang === 'th' ? "วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด" : "Start date must be before end date", true);
            return;
        }
        const diffDays = Math.round((ed - sd) / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 90) {
            showToast(currentLang === 'th' ? "ช่วงวันที่เกิน 90 วัน กรุณาตรวจสอบ" : "Range exceeds 90 days, please check", true);
            return;
        }
        
        if (isCalculating) {
            window.isPendingCalc = true;
            return;
        }
        
        do {
            window.isPendingCalc = false;
            await window.generateSchedule();
        } while (window.isPendingCalc);
    }
};

// Explicitly attach all remaining entry points called by inline HTML to window object
window.addDoctor = addDoctor;
window.removeDoctor = removeDoctor;
window.addOffRow = addOffRow;
window.deleteOffRow = deleteOffRow;
window.updateOffRow = updateOffRow;
window.addExtraSlotRow = addExtraSlotRow;
window.deleteExtraSlot = deleteExtraSlot;
window.updateExtraSlot = updateExtraSlot;

window.openManualModal = function () {
    const modal = document.getElementById('manualModal');
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100');
        const card = modal.querySelector('.relative');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    }
};

window.closeManualModal = function () {
    const modal = document.getElementById('manualModal');
    if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0', 'pointer-events-none');
        const card = modal.querySelector('.relative');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
    }
};

// ====== CONFIG EXPORT & IMPORT ======
window.exportConfigJSON = function () {
    const config = {
        doctors: doctors,
        offData: offData,
        extraSlotsData: extraSlotsData,
        manualOverrides: manualOverrides,
        inputs: {
            inputMonth: document.getElementById('inputMonth')?.value || '',
            inputYear: document.getElementById('inputYear')?.value || '',
            inputStartDate: document.getElementById('inputStartDate')?.value || '',
            inputEndDate: document.getElementById('inputEndDate')?.value || '',
            inputDefaultSlots: document.getElementById('inputDefaultSlots')?.value || '',
            inputSpecialHols: document.getElementById('inputSpecialHols')?.value || '',
            inputNoDuty: document.getElementById('inputNoDuty')?.value || '',
            inputDoctorRoles: document.getElementById('inputDoctorRoles')?.value || '',
            inputDefaultRoleSlots: document.getElementById('inputDefaultRoleSlots')?.value || '',
            inputRoleQuotas: document.getElementById('inputRoleQuotas')?.value || '',
            inputConflicts: document.getElementById('inputConflicts')?.value || '',
            inputSpecialDays: document.getElementById('inputSpecialDays')?.value || '',
            inputSpecialDocs: document.getElementById('inputSpecialDocs')?.value || ''
        },
        checkboxes: {
            chkCustomDateRange: document.getElementById('chkCustomDateRange')?.checked || false,
            chkRoleBased: document.getElementById('chkRoleBased')?.checked || false,
            chkPreventConsecutive: document.getElementById('chkPreventConsecutive')?.checked || false,
            chkPreventLongGaps: document.getElementById('chkPreventLongGaps')?.checked || false,
            chkBalanceShifts: document.getElementById('chkBalanceShifts')?.checked || false,
            chkAllowBlankDays: document.getElementById('chkAllowBlankDays')?.checked || false,
            chkUseSpecialRule: document.getElementById('chkUseSpecialRule')?.checked || false
        }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "schedule_config.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();

    showToast(currentLang === 'th' ? "ส่งออกการตั้งค่าสำเร็จ!" : "Config exported successfully!");
};

window.importConfigJSON = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const config = JSON.parse(e.target.result);

            if (config.doctors && !Array.isArray(config.doctors)) throw new Error("Invalid format");
            if (config.offData && !Array.isArray(config.offData)) throw new Error("Invalid format");
            if (config.extraSlotsData && !Array.isArray(config.extraSlotsData)) throw new Error("Invalid format");

            if (config.doctors) doctors = config.doctors;
            if (config.offData) offData = config.offData;
            if (config.extraSlotsData) extraSlotsData = config.extraSlotsData;
            if (config.manualOverrides) {
                manualOverrides = config.manualOverrides;
            } else {
                manualOverrides = {};
            }

            if (config.inputs) {
                Object.keys(config.inputs).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = config.inputs[id];
                });
            }

            if (config.checkboxes) {
                Object.keys(config.checkboxes).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.checked = config.checkboxes[id];
                });
            }

            // Explicitly trigger the custom date range toggle logic
            const chkCustom = document.getElementById('chkCustomDateRange');
            if (chkCustom) {
                chkCustom.dispatchEvent(new Event('change'));
            }

            // Sync UI components
            syncDoctorsToInput();
            if (typeof syncDoctorRolesInput === 'function') syncDoctorRolesInput();
            renderDoctorTags();
            renderOffRequests();
            renderExtraSlots();
            renderSpecialDocsCheckboxList();

            toggleRoleBasedUI();
            toggleSpecialRuleUI();

            const importInput = document.getElementById('importConfigFile');
            if (importInput) importInput.value = ""; // Reset file input

            showToast(currentLang === 'th' ? "นำเข้าการตั้งค่าสำเร็จ!" : "Config imported successfully!");

            // Re-calculate
            if (window.initialized) {
                generateSchedule();
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
            showToast(currentLang === 'th' ? "เกิดข้อผิดพลาดในการอ่านไฟล์ JSON" : "Error reading JSON file", true);
        }
    };
    reader.readAsText(file);
};

// --- UI Utility: Drag and Drop & Undo Stack ---
const undoStack = [];

window.pushToUndoStack = function() {
    undoStack.push(JSON.parse(JSON.stringify(manualOverrides)));
    if (undoStack.length > 20) undoStack.shift();
};

window.undoLastAction = function() {
    if (undoStack.length > 0) {
        manualOverrides = undoStack.pop();
        applyManualOverrides();
        renderTableView();
        renderCalendarView();
        
        if (typeof renderPersonCentricView === 'function') {
            const config = parseUIConfig();
            renderPersonCentricView(config);
        }

        recalculateCounts();
        updateStatsDashboard();
        showToast(currentLang === 'th' ? "เลิกทำ (Undo) สำเร็จ" : "Undo successful");
    } else {
        showToast(currentLang === 'th' ? "ไม่มีการกระทำที่สามารถเลิกทำได้" : "Nothing to undo", true);
    }
};

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        window.undoLastAction();
    }
});

window.handleDragStart = function(e, day, slotIndex, docIndex) {
    if (docIndex < 0) return;
    const docName = doctors[docIndex];
    if (!docName) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, slotIndex, docName }));
    e.dataTransfer.effectAllowed = 'move';
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

window.handleDrop = function(e, targetDay, targetSlotIndex, targetDocIndex) {
    e.preventDefault();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (!data) return;
        const srcDay = data.day;
        const srcSlot = data.slotIndex;
        const srcDoc = data.docName;
        
        if (srcDay === targetDay && srcSlot === targetSlotIndex) return;

        window.pushToUndoStack();
        window.isDragAndDropOperation = true;

        const srcDocIdx = doctors.indexOf(srcDoc);
        let targetDocIdx = targetDocIndex;

        // Execute swap manually 
        window.updateDoctorAssignment(srcDay, srcSlot, targetDocIdx);
        window.updateDoctorAssignment(targetDay, targetSlotIndex, srcDocIdx);
        
        window.isDragAndDropOperation = false;
        
        // Final refresh to ensure counts are fully up to date
        renderTableView();
        renderCalendarView();
        
        showToast(currentLang === 'th' ? 'สลับเวรด้วยการลากวางสำเร็จ' : 'Drag & Drop swap successful');
    } catch (err) {
        console.error("Drag and drop failed:", err);
    }
};

// Render Person-Centric View
function renderPersonCentricView(config) {
    const head = document.getElementById('personViewHeader');
    const body = document.getElementById('personViewBody');
    if (!head || !body) return;

    let headHtml = `<tr class="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider"><th class="py-2 px-4 border-b border-r border-slate-200 dark:border-slate-800 font-bold sticky left-0 bg-white dark:bg-slate-900 z-10 min-w-[120px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-none">${translations[currentLang].tableHeaderDoctors || "Doctor"}</th>`;
    for(let d=1; d<=config.numDays; d++) {
        const dayRow = globalResult.schedule[d-1];
        const dayName = dayRow ? dayRow.dayName.substring(0,2) : '';
        const isHol = dayRow ? dayRow.isHoliday : false;
        let dayClass = isHol ? "text-rose-500 font-bold" : "text-slate-500 dark:text-slate-400";
        
        let displayDateNum = d;
        let monthLabel = '';
        let borderClass = "border-slate-200 dark:border-slate-800";
        
        if (isCustomDateRange && scheduleDates && scheduleDates[d - 1]) {
            const dateObj = scheduleDates[d - 1];
            displayDateNum = dateObj.getDate();
            if (displayDateNum === 1 || d === 1) {
                const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthNamesTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                const mName = currentLang === 'th' ? monthNamesTh[dateObj.getMonth()] : monthNamesEn[dateObj.getMonth()];
                monthLabel = ` ${mName}`;
            }
            if (displayDateNum === 1 && d > 1) {
                 borderClass = "border-l-2 border-indigo-300 dark:border-indigo-700 " + borderClass;
            }
        }
        
        headHtml += `<th class="py-2 px-1 border-b ${borderClass} text-center w-8 min-w-[32px] ${dayClass}"><div class="text-[10px] font-bold">${dayName}</div><div class="text-xs font-black whitespace-nowrap">${displayDateNum}${monthLabel}</div></th>`;
    }
    headHtml += `</tr>`;
    head.innerHTML = headHtml;

    let bodyHtml = '';
    
    const displayDocs = [...doctors];
    if (globalResult.schedule.some(d => d.selectedDocs.some(s => s && s.name === SHORTAGE_MARKER))) {
        displayDocs.push(SHORTAGE_MARKER);
    }
    
    displayDocs.forEach((doc, idx) => {
        let isShortage = doc === SHORTAGE_MARKER;
        let docName = isShortage ? (translations[currentLang].shortageSlot || "Shortage") : doc;
        
        let rowClass = idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/20";
        bodyHtml += `<tr class="${rowClass} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">`;
        bodyHtml += `<td class="py-2 px-4 border-b border-r border-slate-200 dark:border-slate-800 font-bold sticky left-0 z-10 min-w-[120px] ${rowClass} ${isShortage ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-none">${esc(docName)}</td>`;
        
        for(let d=1; d<=config.numDays; d++) {
            const dayRow = globalResult.schedule[d-1];
            
            let borderClass = "border-slate-200 dark:border-slate-800";
            if (isCustomDateRange && scheduleDates && scheduleDates[d - 1]) {
                if (scheduleDates[d - 1].getDate() === 1 && d > 1) {
                    borderClass = "border-l-2 border-indigo-300 dark:border-indigo-700 " + borderClass;
                }
            }

            if (!dayRow || dayRow.isNoDuty) {
                bodyHtml += `<td class="border-b ${borderClass} bg-slate-200/50 dark:bg-slate-800/40"></td>`;
                continue;
            }
            
            let slotIndices = [];
            dayRow.selectedDocs.forEach((sd, sIdx) => {
                if (sd && sd.name === doc) slotIndices.push(sIdx + 1);
            });
            
            if (slotIndices.length > 0) {
                let bgClass = "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400";
                if (isShortage) {
                    bgClass = "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400";
                } else {
                    const colors = [
                        "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400",
                        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400",
                        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
                        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
                        "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400",
                        "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400",
                        "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"
                    ];
                    bgClass = colors[doctors.indexOf(doc) % colors.length];
                }
                
                bodyHtml += `<td class="border-b ${borderClass} p-0.5 text-center"><div class="rounded w-full h-full text-[10px] font-bold flex items-center justify-center py-1 ${bgClass}">${slotIndices.join(',')}</div></td>`;
            } else {
                bodyHtml += `<td class="border-b ${borderClass}"></td>`;
            }
        }
        bodyHtml += `</tr>`;
    });
    body.innerHTML = bodyHtml;
}
