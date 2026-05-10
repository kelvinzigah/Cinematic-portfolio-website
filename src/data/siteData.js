export const contacts = {
  email: "kzeezigah@gmail.com",
  github: "https://github.com/kelvinzigah",
  linkedin: "https://www.linkedin.com/in/kelvinzigah/",
  resume: "/Kelvin-Zigah-Resume.pdf",
};

export const skillGroups = [
  {
    label: "Hardware / Electronics",
    skills: ["FPGA design", "Analog circuits", "Digital design", "ARM assembly", "Firmware"],
  },
  {
    label: "Embedded / Firmware",
    skills: ["C++", "Embedded C", "ARM assembly", "Firmware"],
  },
  {
    label: "FPGA / Digital Systems",
    skills: ["SystemVerilog", "Quartus Prime", "ModelSim", "Vivado"],
  },
  {
    label: "Lab Automation / Test Systems",
    skills: ["Python", "LTSpice", "Linux", "Git"],
  },
  {
    label: "Software / Web",
    skills: ["Python", "C++", "Git", "Linux"],
  },
  {
    label: "Tools",
    skills: ["Altium Designer", "LTSpice", "Quartus Prime", "ModelSim", "Vivado", "Git", "Linux"],
  },
  {
    label: "Soft Skills",
    skills: ["Leadership", "Teamwork", "Communication"],
  },
];

export const experiences = [
  {
    role: "Optical Hardware Intern",
    org: "Fonex Data Systems",
    location: "Montreal, QC",
    dates: "Sep 2025-Present",
    summary: [
      "Tests SFP, SFP+, and QSFP optical transceivers using BERT equipment, network switches, and variable optical attenuators.",
      "Diagnoses Cisco and Nokia switch configuration issues including VLAN provisioning and MAC address management.",
      "Sources international suppliers for fibre Bragg grating dispersion compensation modules.",
      "Builds Python scripts for EEPROM firmware reprogramming and automated Excel report logging.",
    ],
  },
  {
    role: "Director of Projects",
    org: "IEEE Concordia",
    location: "Concordia University, Montreal, QC",
    dates: "Present",
    summary: [
      "Leads a team of 8 designing a BMS PCB for a 40A battery pack for the IEEE Ebike Project.",
      "Researches practical RISC-V CPU designs to help students engage with ASIC design.",
      "Advises magnetic encoder PCB strategy for a 6-DOF robotic arm project.",
    ],
  },
  {
    role: "GLV and Firmware Sub-team",
    org: "Concordia Formula Electric",
    location: "Concordia University, Montreal, QC",
    dates: "Present",
    summary: [
      "Designs Altium PCBs for GLV subsystems for the 2026 prototype car.",
      "Works on electronics and firmware concepts for CAN-based vehicle data acquisition.",
    ],
  },
  {
    role: "Lab Supervisor",
    org: "IEEE Concordia",
    location: "Concordia University, Montreal, QC",
    dates: "Sep 2024-Present",
    summary: [
      "Leads circuit design and FPGA workshops.",
      "Troubleshoots microcontroller and power electronics circuits using oscilloscopes and multimeters.",
      "Manages lab equipment and supports collaboration for robotics projects.",
    ],
  },
];

export const projects = [
  {
    name: "STM32 PCB Design",
    date: "July 2025",
    type: "Personal",
    status: "Complete / prototype-ready",
    category: "Hardware module",
    tags: ["Analog Circuit Design", "Altium Designer", "LTSpice", "STM32CubeIDE"],
    github: contacts.github,
    imageClass: "project-media-stm",
    summary: [
      "Designed an STM32-based low-power MCU PCB in Altium Designer.",
      "Simulated power circuitry in LTSpice.",
      "Prototyped through-hole components on perfboard.",
      "Integrated I2C and UART buses using STM32CubeIDE.",
    ],
  },
  {
    name: "RISC-V CPU on Altera DE2-115 FPGA",
    date: "Jan 2025-Present",
    type: "IEEE Concordia",
    status: "In progress",
    category: "FPGA / digital system",
    tags: ["SystemVerilog", "FPGA", "Embedded Systems"],
    github: contacts.github,
    imageClass: "project-media-riscv",
    summary: [
      "Designed a multi-cycle RISC-V CPU with RV32I ISA in SystemVerilog.",
      "Integrated UART/SPI for real-time data exchange.",
      "Verified with ModelSim and synthesized with Quartus.",
      "Programmed on Altera DE2-115 FPGA board.",
      "Currently integrating pipelining plus hazard/interrupt controls.",
    ],
  },
  {
    name: "TSSI and RTM Indicator PCB Design",
    date: "2025",
    type: "Concordia Formula Electric",
    status: "Complete",
    category: "Vehicle electronics",
    tags: ["Analog Circuit Design", "Altium Designer", "LTSpice"],
    github: contacts.github,
    imageClass: "project-media-tssi",
    summary: [
      "Designed/developed PCBs for the TSSI indicator and ready-to-move lights on the main chassis of the race car.",
    ],
  },
];
