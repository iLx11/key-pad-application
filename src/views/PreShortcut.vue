<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { toHexStr } from '../utils/strTools'
import { useConfigStore } from '../stores/configStore'
import { getStringMap } from '../utils/hidKeyCode'
import {XBox} from '@/utils/xBox/xBox.js'

const configStore = useConfigStore()
const win = window as any
// const key = [{"key":0,"word":"Tab","dec":"43","hex":"2B","isHover":false},{"key":1,"word":"Backspace","dec":"42","hex":"2A","isHover":false},{"key":2,"word":"Escape","dec":"41","hex":"29","isHover":false},{"key":3,"word":"Enter","dec":"40","hex":"28","isHover":false},{"key":4,"word":"CapsLock","hex":"39","isHover":false},{"key":5,"word":"F1","hex":"3A","isHover":false},{"key":6,"word":"F2","hex":"3B","isHover":false},{"key":7,"word":"F3","hex":"3C","isHover":false},{"key":8,"word":"F4","hex":"3D","isHover":false},{"key":9,"word":"F5","hex":"3E","isHover":false},{"key":10,"word":"F6","hex":"3F","isHover":false},{"key":11,"word":"F7","hex":"40","isHover":false},{"key":12,"word":"F8","hex":"41","isHover":false},{"key":13,"word":"F9","hex":"42","isHover":false},{"key":14,"word":"F10","hex":"43","isHover":false},{"key":15,"word":"F11","hex":"44","isHover":false},{"key":16,"word":"F12","hex":"45","isHover":false},{"key":17,"word":"PrintScreen","hex":"46","isHover":false},{"key":18,"word":"ScrollLock","hex":"47","isHover":false},{"key":19,"word":"Pause","hex":"48","isHover":false},{"key":20,"word":"Insert","hex":"49","isHover":false},{"key":21,"word":"Home","hex":"4A","isHover":false},{"key":22,"word":"PageUp","hex":"4B","isHover":false},{"key":23,"word":"DeleteForward","hex":"4C","isHover":false},{"key":24,"word":"End","hex":"4D","isHover":false},{"key":25,"word":"PageDown","hex":"4E","isHover":false},{"key":26,"word":"ArrowRight","hex":"4F","isHover":false},{"key":27,"word":"ArrowLeft","hex":"50","isHover":false},{"key":28,"word":"ArrowDown","hex":"51","isHover":false},{"key":29,"word":"ArrowUp","hex":"52","isHover":false},{"key":30,"word":"NumLock","hex":"53","isHover":false},{"key":31,"word":"Clear","hex":"53","isHover":false}]
const specialKeyCode = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
const specialKeyStr = [
  ['ctrl', 'control', '⌃'],
  ['shift', '⇧'],
  ['alt', 'Option', '⌥'],
  ['win', 'Windows logo key', 'windows', '⌘']
]
const otherKey = [
  { word: ['Spacebar'], dec: '44', hex: '2C'},
  { word: ['Tab'], dec: '43', hex: '2B' },
  { word: ['Backspace'], dec: '42', hex: '2A' },
  { word: ['Escape', 'Esc'], dec: '41', hex: '29' },
  { word: ['Enter', '↩'], dec: '40', hex: '28' },
  { word: ['CapsLock'], hex: '39' },
  { word: ['F10'], hex: '43' },
  { word: ['F11'], hex: '44' },
  { word: ['F12'], hex: '45' },
  { word: ['F1'], hex: '3A' },
  { word: ['F2'], hex: '3B' },
  { word: ['F3'], hex: '3C' },
  { word: ['F4'], hex: '3D' },
  { word: ['F5'], hex: '3E' },
  { word: ['F6'], hex: '3F' },
  { word: ['F7'], hex: '40' },
  { word: ['F8'], hex: '41' },
  { word: ['F9'], hex: '42' },
  { word: ['PrintScreen', 'Print Screen'], hex: '46' },
  { word: ['ScrollLock', 'Scroll Lock'], hex: '47' },
  { word: ['Pause'], hex: '48' },
  { word: ['Insert'], hex: '49' },
  { word: ['Home'], hex: '4A' },
  { word: ['PageUp', 'Page Up'], hex: '4B' },
  { word: ['DeleteForward', 'Delete Forward'], hex: '4C' },
  { word: ['End'], hex: '4D' },
  { word: ['PageDown', 'Page Down'], hex: '4E' },
  { word: ['ArrowRight', '→', 'Right arrow'], hex: '4F' },
  { word: ['ArrowLeft', '←', 'Left arrow'], hex: '50' },
  { word: ['ArrowDown', '↓', 'Down arrow'], hex: '51' },
  { word: ['ArrowUp', '↑', 'Up arrow'], hex: '52' },
  { word: ['NumLock'], hex: '53' },
  { word: ['Clear'], hex: '53' }
]

// onMounted(() => {
//     key.forEach(o => {
//       delete o.key
//       delete o.isHover
//       o.word = o.word.split()
//     })
//     console.info(JSON.stringify(key))
// })

const keyArray = reactive([
  {
    id: 0,
    softName: 'ae',
    softPath: 'design/ae.json',
    softFont: `<svg width="80" height="80" viewBox="0 0 83 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_912_9)"><path d="M67.5214 0H14.5299C6.50526 0 0 6.50526 0 14.5299V65.4701C0 73.4947 6.50526 80 14.5299 80H67.5214C75.546 80 82.0513 73.4947 82.0513 65.4701V14.5299C82.0513 6.50526 75.546 0 67.5214 0Z" fill="#00005B"/><path d="M32.9624 47.8634H20.2474L17.6604 55.915C17.6252 56.0616 17.54 56.1913 17.4194 56.2817C17.2988 56.3721 17.1504 56.4177 16.9999 56.4104H10.5599C10.1927 56.4104 10.0642 56.2086 10.1746 55.805L21.1832 24.2314C21.2932 23.9012 21.4034 23.5783 21.5134 23.156C21.6576 22.4216 21.7313 21.6752 21.7336 20.9268C21.7261 20.8745 21.731 20.8212 21.7477 20.771C21.7644 20.7209 21.7926 20.6753 21.83 20.6379C21.8674 20.6005 21.9129 20.5723 21.9631 20.5556C22.0132 20.5389 22.0666 20.534 22.1189 20.5415H30.8708C31.127 20.5415 31.2738 20.6332 31.3111 20.8168L43.8058 55.86C43.9158 56.2272 43.8057 56.4107 43.4756 56.4104H36.32C36.1971 56.4241 36.0734 56.3925 35.9721 56.3216C35.8708 56.2507 35.7988 56.1453 35.7696 56.0251L32.9624 47.8634ZM22.2291 41.0745H30.9258C30.7056 40.3409 30.4487 39.5152 30.1551 38.5975C29.861 37.6807 29.5491 36.6991 29.2194 35.6527C28.8892 34.607 28.559 33.5611 28.2287 32.5153C27.8985 31.4695 27.5957 30.4604 27.3204 29.4879C27.0453 28.5161 26.7976 27.6263 26.5774 26.8184H26.5223C26.2126 28.305 25.8268 29.7747 25.3664 31.2218C24.8521 32.8731 24.3292 34.5611 23.7977 36.2857C23.2654 38.011 22.7425 39.6072 22.2291 41.0745Z" fill="#9999FF"/><path d="M64.0619 44.7295H53.2185C53.3513 45.8024 53.7076 46.8355 54.2644 47.7622C54.8799 48.6798 55.7504 49.3973 56.7687 49.8263C58.1487 50.4234 59.6413 50.716 61.1447 50.684C62.3374 50.6611 63.5256 50.5306 64.6949 50.2942C65.7407 50.153 66.7656 49.8858 67.7473 49.4985C67.9304 49.3523 68.0226 49.4435 68.0226 49.7737V55.0028C68.0316 55.1452 68.0031 55.2876 67.9399 55.4156C67.8769 55.5157 67.7923 55.6003 67.6922 55.6632C66.6033 56.1456 65.4574 56.4869 64.2821 56.6791C62.6854 56.979 61.0627 57.1173 59.4383 57.092C56.8323 57.092 54.6489 56.6883 52.8882 55.881C51.2236 55.1477 49.7535 54.0357 48.5949 52.6335C47.5127 51.3123 46.7077 49.7866 46.228 48.1475C45.753 46.5297 45.512 44.8522 45.5125 43.1661C45.5074 41.3251 45.7954 39.4949 46.3657 37.7444C46.9149 36.0369 47.7834 34.4492 48.9252 33.0658C50.0513 31.6985 51.4595 30.5908 53.0534 29.8182C54.6677 29.0296 56.5761 28.7466 58.7778 28.7466C60.6037 28.7005 62.4173 29.0576 64.0894 29.7924C65.4955 30.3921 66.7333 31.3269 67.6947 32.5153C68.5965 33.679 69.2859 34.9927 69.7313 36.3959C70.165 37.7481 70.3878 39.1591 70.3918 40.5791C70.3918 41.3867 70.3643 42.1206 70.3092 42.7808C70.2543 43.4413 70.2084 43.9183 70.1716 44.2119C70.1574 44.3333 70.099 44.4452 70.0077 44.5263C69.9163 44.6075 69.7984 44.6523 69.6762 44.6523C69.456 44.6523 69.0799 44.6798 68.5479 44.7349C68.0155 44.7899 67.355 44.8266 66.5664 44.8449C65.7768 44.8638 64.9426 44.7295 64.0619 44.7295ZM53.2185 39.7153H60.4291C61.3098 39.7153 61.9611 39.7061 62.383 39.6878C62.6654 39.6595 62.938 39.5692 63.1813 39.4232V39.0929C63.1702 38.6624 63.096 38.2359 62.9611 37.827C62.6641 36.8879 62.0671 36.0723 61.2616 35.5055C60.4561 34.9387 59.4869 34.652 58.5027 34.6895C57.5764 34.6335 56.6538 34.8483 55.8474 35.3077C55.0411 35.7671 54.3858 36.4511 53.9616 37.2765C53.5845 38.0442 53.3336 38.8677 53.2185 39.7153Z" fill="#9999FF"/></g><defs><clipPath id="clip0_912_9"><rect width="82.0513" height="80" fill="white"/></clipPath></defs></svg>`
  },
  {
    id: 1,
    softName: 'ai',
    softPath: 'design/ai.json',
    softFont: `<svg width="80" height="80" viewBox="0 0 83 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_906_1865)"><path d="M67.5214 0H14.5299C6.50526 0 0 6.50526 0 14.5299V65.4701C0 73.4947 6.50526 80 14.5299 80H67.5214C75.546 80 82.0513 73.4947 82.0513 65.4701V14.5299C82.0513 6.50526 75.546 0 67.5214 0Z" fill="#330000"/><path d="M39.7607 48.0096H27.0459L24.4589 56.0459C24.4237 56.1924 24.3384 56.3221 24.2178 56.4125C24.0972 56.503 23.9489 56.5485 23.7984 56.5413H17.3584C16.9911 56.5413 16.8627 56.3395 16.9731 55.9358L27.9815 24.2312C28.0917 23.901 28.2018 23.5249 28.3119 23.1028C28.4559 22.3684 28.5296 21.622 28.5321 20.8736C28.5246 20.8213 28.5294 20.7679 28.5461 20.7178C28.5629 20.6676 28.591 20.6221 28.6284 20.5847C28.6658 20.5473 28.7114 20.5191 28.7615 20.5024C28.8117 20.4856 28.865 20.4808 28.9174 20.4883H37.669C37.9255 20.4883 38.0722 20.58 38.1094 20.7635L50.6042 55.9908C50.7143 56.3581 50.6041 56.5416 50.2739 56.5413H43.1183C42.9954 56.5549 42.8717 56.5233 42.7704 56.4524C42.6692 56.3815 42.5971 56.2761 42.5679 56.156L39.7607 48.0096ZM29.0274 41.0743H37.7241C37.504 40.3407 37.2471 39.515 36.9536 38.5973C36.6594 37.6805 36.3476 36.6989 36.0179 35.6525C35.6876 34.6068 35.3572 33.561 35.027 32.5151C34.6968 31.4693 34.3941 30.4602 34.1189 29.4877C33.8436 28.5159 33.5959 27.6261 33.3759 26.8182H33.3208C33.0109 28.3048 32.6251 29.7745 32.1649 31.2216C31.6506 32.8729 31.1276 34.5609 30.5961 36.2855C30.0637 38.0108 29.5408 39.6071 29.0274 41.0743Z" fill="#FF9A00"/><path d="M58.0343 26.3229C57.4729 26.3455 56.9131 26.2493 56.3914 26.0406C55.8697 25.8319 55.398 25.5155 55.007 25.112C54.6171 24.691 54.3142 24.1971 54.1158 23.6587C53.9174 23.1202 53.8274 22.5479 53.851 21.9746C53.831 21.4069 53.9309 20.8414 54.1443 20.315C54.3577 19.7886 54.6798 19.3131 55.0894 18.9197C55.4951 18.5303 55.974 18.2252 56.4984 18.0221C57.0227 17.8189 57.5822 17.7218 58.1443 17.7363C59.4654 17.7363 60.5021 18.1307 61.2543 18.9197C61.634 19.3297 61.9291 19.8105 62.1227 20.3347C62.3163 20.8589 62.4046 21.4162 62.3826 21.9746C62.4056 22.5501 62.3127 23.1245 62.1094 23.6634C61.9061 24.2024 61.5966 24.695 61.1992 25.112C60.7839 25.5214 60.2882 25.8404 59.7435 26.0488C59.1988 26.2572 58.6169 26.3505 58.0343 26.3229ZM54.2362 55.9909V29.6805C54.2362 29.3503 54.3825 29.1851 54.6766 29.1851H61.4469C61.7403 29.1851 61.887 29.3502 61.8873 29.6805V55.9909C61.8873 56.3582 61.7405 56.5416 61.4469 56.5414H54.7317C54.4015 56.5414 54.2364 56.3579 54.2362 55.9909Z" fill="#FF9A00"/></g><defs><clipPath id="clip0_906_1865"><rect width="82.0513" height="80" fill="white"/></clipPath></defs></svg>`
  },
  {
    id: 2,
    softName: 'id',
    softPath: 'design/ai.json',
    softFont: `<svg width="83" height="80" viewBox="0 0 83 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_906_1830)"><path d="M67.5214 0H14.5299C6.50526 0 0 6.50526 0 14.5299V65.4701C0 73.4947 6.50526 80 14.5299 80H67.5214C75.546 80 82.0513 73.4947 82.0513 65.4701V14.5299C82.0513 6.50526 75.546 0 67.5214 0Z" fill="#49021F"/><path d="M29.7977 20.9286V55.9908C29.7977 56.3581 29.6326 56.5415 29.3024 56.5413H22.6421C22.3481 56.5413 22.2014 56.3578 22.2019 55.9908V20.9286C22.2019 20.6353 22.367 20.4885 22.6972 20.4882H29.3574C29.4172 20.4797 29.4781 20.4853 29.5355 20.5044C29.5928 20.5235 29.6448 20.5557 29.6875 20.5984C29.7303 20.6412 29.7625 20.6932 29.7816 20.7505C29.8007 20.8078 29.8062 20.8688 29.7977 20.9286Z" fill="#FF3366"/><path d="M49.5031 57.0919C46.9696 57.1304 44.4594 56.6039 42.1549 55.5506C40.0081 54.5571 38.2135 52.9352 37.0085 50.8995C35.7605 48.8268 35.1366 46.2306 35.137 43.111C35.1162 40.5847 35.7618 38.0977 37.0085 35.9004C38.2926 33.6622 40.1811 31.831 42.4577 30.6163C44.8425 29.2952 47.723 28.6347 51.0993 28.6347C51.2825 28.6347 51.521 28.6439 51.8148 28.6623C52.1081 28.6812 52.4567 28.7087 52.8607 28.7448V17.9014C52.8607 17.6451 52.9708 17.5161 53.191 17.5161H60.1263C60.1711 17.5097 60.2169 17.5138 60.2599 17.5282C60.3029 17.5425 60.3419 17.5666 60.374 17.5986C60.4061 17.6307 60.4302 17.6697 60.4445 17.7127C60.4589 17.7557 60.463 17.8015 60.4566 17.8463V50.3766C60.4566 51.001 60.4841 51.6799 60.5391 52.4132C60.5942 53.1476 60.6401 53.8081 60.6768 54.3947C60.6836 54.509 60.6556 54.6228 60.5967 54.721C60.5378 54.8192 60.4505 54.8973 60.3465 54.9452C58.5573 55.6914 56.6937 56.2449 54.7872 56.5964C53.0441 56.9181 51.2757 57.0839 49.5031 57.0919ZM52.8606 50.2665V35.2399C52.5631 35.1593 52.2594 35.104 51.9525 35.0747C51.5776 35.037 51.2009 35.0187 50.8241 35.0197C49.4884 35.0064 48.1684 35.3081 46.9711 35.9004C45.805 36.48 44.8093 37.3525 44.0814 38.4323C43.3289 39.5332 42.9528 40.9827 42.953 42.7807C42.9262 43.9806 43.1221 45.175 43.5309 46.3034C43.8636 47.2127 44.3894 48.0389 45.0722 48.7253C45.7258 49.3568 46.5172 49.8279 47.3839 50.1014C48.2994 50.3979 49.2563 50.5465 50.2186 50.5417C50.7321 50.5417 51.2091 50.5234 51.6497 50.4867C52.0599 50.4558 52.4658 50.382 52.8606 50.2665Z" fill="#FF3366"/></g><defs><clipPath id="clip0_906_1830"><rect width="82.0513" height="80" fill="white"/></clipPath></defs></svg>`
  },
  {
    id: 3,
    softName: 'ps',
    softPath: 'design/ps.json',
    softFont: `<svg width="83" height="80" viewBox="0 0 83 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_906_1855)"><path d="M67.5214 0H14.5299C6.50526 0 0 6.50526 0 14.5299V65.4701C0 73.4947 6.50526 80 14.5299 80H67.5214C75.546 80 82.0513 73.4947 82.0513 65.4701V14.5299C82.0513 6.50526 75.546 0 67.5214 0Z" fill="#001E36"/><path d="M18.4758 56.1007V20.9284C18.4758 20.6721 18.5859 20.5431 18.8061 20.5431C19.3926 20.5431 19.928 20.5345 20.7357 20.5156C21.5425 20.4975 22.414 20.4792 23.3502 20.4606C24.286 20.4424 25.2768 20.4241 26.3226 20.4055C27.3683 20.3874 28.4049 20.3783 29.4324 20.3779C32.2207 20.3779 34.5692 20.7265 36.4778 21.4238C38.1996 22.0062 39.7697 22.9651 41.074 24.2309C42.1797 25.3281 43.0341 26.6521 43.5784 28.1115C44.0933 29.5318 44.3542 31.0316 44.3491 32.5424C44.3491 35.4786 43.6702 37.9005 42.3125 39.808C40.9458 41.7235 39.0247 43.1739 36.8082 43.9638C34.4964 44.8264 31.9274 45.1189 29.1022 45.1189C28.2946 45.1189 27.7258 45.1098 27.3958 45.0914C27.0656 45.0733 26.5703 45.0641 25.9098 45.0639V56.0457C25.9194 56.113 25.9132 56.1816 25.8917 56.2461C25.8702 56.3106 25.834 56.3692 25.7859 56.4172C25.7378 56.4653 25.6792 56.5015 25.6147 56.523C25.5502 56.5445 25.4816 56.5507 25.4143 56.5411H18.8611C18.604 56.5411 18.4758 56.3948 18.4758 56.1007ZM25.9098 27.1482V38.62C26.3862 38.657 26.8265 38.6753 27.2307 38.675H29.0471C30.3836 38.6706 31.7113 38.4586 32.9828 38.0467C34.0732 37.7228 35.0476 37.0923 35.7899 36.2303C36.5054 35.3866 36.8632 34.2124 36.8633 32.7076C36.8923 31.6428 36.6153 30.5921 36.065 29.6802C35.4866 28.7983 34.6506 28.1161 33.6707 27.7262C32.3913 27.2289 31.0246 26.9949 29.6526 27.0382C28.7718 27.0382 27.9921 27.0473 27.3134 27.0656C26.6339 27.0846 26.1661 27.1121 25.9098 27.1482Z" fill="#31A8FF"/><path d="M65.6311 36.534C64.5967 36.0025 63.495 35.6137 62.3561 35.3781C61.1011 35.0902 59.8181 34.9425 58.5306 34.9377C57.8342 34.9189 57.1387 35.0023 56.4665 35.1855C56.0386 35.2807 55.6583 35.5245 55.3931 35.8735C55.2137 36.1526 55.1182 36.4774 55.118 36.8092C55.128 37.1311 55.2441 37.4407 55.4482 37.6899C55.7697 38.066 56.1626 38.3747 56.604 38.5981C57.3888 39.0207 58.1975 39.3975 59.0259 39.7265C60.8732 40.3449 62.6384 41.1858 64.2825 42.2309C65.4025 42.9378 66.3293 43.9119 66.9796 45.0656C67.5265 46.1581 67.8003 47.3669 67.7778 48.5884C67.8107 50.2013 67.3498 51.7858 66.4568 53.1294C65.5007 54.4933 64.1728 55.5537 62.6312 56.1842C60.961 56.9179 58.8969 57.2849 56.439 57.2851C54.8775 57.3009 53.3186 57.1533 51.7878 56.8448C50.5818 56.6236 49.4077 56.2539 48.2926 55.7439C48.1722 55.6818 48.0721 55.5867 48.0039 55.4697C47.9356 55.3527 47.9021 55.2187 47.9073 55.0834V49.1388C47.9007 49.0806 47.91 49.0217 47.9342 48.9683C47.9585 48.915 47.9968 48.8693 48.045 48.836C48.0923 48.8093 48.1466 48.7976 48.2006 48.8026C48.2547 48.8075 48.306 48.8288 48.3477 48.8636C49.6646 49.6401 51.0945 50.2065 52.5859 50.5424C53.9005 50.8719 55.2489 51.0473 56.604 51.0653C57.8881 51.0653 58.833 50.9001 59.4387 50.5699C59.7123 50.4447 59.9437 50.2429 60.1049 49.9889C60.2661 49.7349 60.3502 49.4396 60.347 49.1388C60.347 48.6623 60.0718 48.2037 59.5214 47.7627C58.971 47.3224 57.8518 46.7903 56.1637 46.1664C54.4354 45.5649 52.7967 44.7317 51.2924 43.6896C50.2165 42.9413 49.3305 41.9516 48.7054 40.7998C48.1641 39.7152 47.8904 38.5167 47.9073 37.3046C47.9042 35.8482 48.3043 34.4194 49.0632 33.1764C49.9284 31.8076 51.1709 30.718 52.641 30.039C54.2553 29.2322 56.2735 28.8286 58.6958 28.828C60.1143 28.8166 61.5315 28.9178 62.934 29.1307C63.9497 29.2596 64.9426 29.5281 65.8847 29.9289C65.9594 29.9503 66.0281 29.9888 66.0854 30.0413C66.1427 30.0939 66.1871 30.159 66.2149 30.2316C66.2521 30.366 66.2706 30.5049 66.27 30.6444V36.2037C66.2738 36.2684 66.2605 36.333 66.2316 36.3909C66.2026 36.4489 66.1589 36.4982 66.1049 36.534C66.0313 36.5706 65.9502 36.5897 65.868 36.5897C65.7858 36.5897 65.7047 36.5706 65.6311 36.534Z" fill="#31A8FF"/></g><defs><clipPath id="clip0_906_1855"><rect width="82.0513" height="80" fill="white"/></clipPath></defs></svg>`
  },
  {
    id: 4,
    softName: 'vscode',
    softPath: 'dev/vscode.json',
    softFont: `<svg viewBox="0 0 256 254" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="80" preserveAspectRatio="xMidYMid"><defs><linearGradient id="c" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#FFF" stop-opacity="0"/></linearGradient><path id="a" d="M180.828 252.605a15.872 15.872 0 0 0 12.65-.486l52.501-25.262a15.94 15.94 0 0 0 9.025-14.364V41.197a15.939 15.939 0 0 0-9.025-14.363l-52.5-25.263a15.877 15.877 0 0 0-18.115 3.084L74.857 96.35l-43.78-33.232a10.614 10.614 0 0 0-13.56.603L3.476 76.494c-4.63 4.211-4.635 11.495-.012 15.713l37.967 34.638-37.967 34.637c-4.623 4.219-4.618 11.502.012 15.714l14.041 12.772a10.614 10.614 0 0 0 13.56.604l43.78-33.233 100.507 91.695a15.853 15.853 0 0 0 5.464 3.571Zm10.464-183.649-76.262 57.889 76.262 57.888V68.956Z"/></defs><mask id="b" fill="#fff"><use xlink:href="#a"/></mask><path fill="#0065A9" d="M246.135 26.873 193.593 1.575a15.885 15.885 0 0 0-18.123 3.08L3.466 161.482c-4.626 4.219-4.62 11.502.012 15.714l14.05 12.772a10.625 10.625 0 0 0 13.569.604L238.229 33.436c6.949-5.271 16.93-.315 16.93 8.407v-.61a15.938 15.938 0 0 0-9.024-14.36Z" /><path fill="#007ACC" d="m246.135 226.816-52.542 25.298a15.887 15.887 0 0 1-18.123-3.08L3.466 92.207c-4.626-4.218-4.62-11.502.012-15.713l14.05-12.773a10.625 10.625 0 0 1 13.569-.603l207.132 157.135c6.949 5.271 16.93.315 16.93-8.408v.611a15.939 15.939 0 0 1-9.024 14.36Z" /><path fill="#1F9CF0" d="M193.428 252.134a15.892 15.892 0 0 1-18.125-3.083c5.881 5.88 15.938 1.715 15.938-6.603V11.273c0-8.318-10.057-12.483-15.938-6.602a15.892 15.892 0 0 1 18.125-3.084l52.533 25.263a15.937 15.937 0 0 1 9.03 14.363V212.51c0 6.125-3.51 11.709-9.03 14.363l-52.533 25.262Z" /><path fill="url(#c)" fill-opacity=".25" d="M180.828 252.605a15.874 15.874 0 0 0 12.65-.486l52.5-25.263a15.938 15.938 0 0 0 9.026-14.363V41.197a15.939 15.939 0 0 0-9.025-14.363L193.477 1.57a15.877 15.877 0 0 0-18.114 3.084L74.857 96.35l-43.78-33.232a10.614 10.614 0 0 0-13.56.603L3.476 76.494c-4.63 4.211-4.635 11.495-.012 15.713l37.967 34.638-37.967 34.637c-4.623 4.219-4.618 11.502.012 15.714l14.041 12.772a10.614 10.614 0 0 0 13.56.604l43.78-33.233 100.506 91.695a15.857 15.857 0 0 0 5.465 3.571Zm10.464-183.65-76.262 57.89 76.262 57.888V68.956Z" /></svg>`
  },
  {
    id: 5,
    softName: 'IDEA',
    softPath: 'dev/idea.json',
    softFont: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/><path d="M28 208h96v16H28v-16ZM24 66l7-7c1 2 4 4 6 4 3 0 5-2 5-6V32h11v25c0 5-1 9-4 12-3 2-6 4-10 4h-1c-5 0-10-2-14-6v-1Zm34-34h32v9H69v7h19v8H69v6h21v10H58V32Zm48 10H94V32h35v10h-12v30h-11V42ZM28 88h19c4-1 8 1 11 3 2 2 3 4 3 7 0 4-3 7-7 9 5 1 8 5 8 10 0 7-5 11-15 11H28V88Zm22 12c0-2-2-3-5-3h-6v7h5c4 0 6-1 6-4Zm-4 11h-7v8h7c3 0 5-1 5-4 0-2-1-3-4-3l-1-1Zm43 17-8-12h-4v12H66V88h18c4-1 9 1 13 4 2 2 3 5 3 9 0 6-3 11-8 13l8 11 16-37h10l17 40h-12l-2-7h-16l-3 7H89Zm32-27-5 11h9l-4-11Zm-38-4h-6v10h6c4 0 6-2 6-5s-2-5-6-5Zm62-9h11v40h-11V88Zm15 0h11l14 21V88h11v40h-10l-15-22v22h-11V88Zm38 34 6-8c4 3 8 5 13 5 3 0 4-1 4-3 0-1 0-2-3-3h-3l-1-1h-2l-2-1c-6-1-10-4-10-11s5-13 15-13c6 0 12 2 16 6l-5 7c-3-2-7-4-11-4-3 0-4 1-4 3l3 3h2l2 1c9 2 15 5 15 12 0 8-6 13-15 13h-1c-7 0-13-2-18-5l-1-1Z" fill="#FFF"/></svg>`
  },
  {
    id: 6,
    softName: 'notion',
    softPath: 'prod/notion.json',
    softFont: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" preserveAspectRatio="xMidYMid" viewBox="0 0 256 268"><path fill="#FFF" d="M16.092 11.538 164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188Z"/><path d="M164.09.608 16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608ZM69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095l-1.819.125Zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921ZM212.377 89.53c1.034 4.681 0 9.362-4.681 9.897l-7.783 1.542v114.404c-6.758 3.637-12.981 5.715-18.18 5.715-8.308 0-10.386-2.604-16.609-10.396l-50.898-80.079v77.476l16.1 3.646s0 9.362-12.989 9.362l-35.814 2.077c-1.043-2.086 0-7.284 3.63-8.318l9.351-2.595V109.823l-12.98-1.052c-1.044-4.68 1.55-11.439 8.826-11.965l38.426-2.585 52.958 81.113v-71.76l-13.498-1.552c-1.043-5.733 3.111-9.896 8.3-10.404l35.84-2.087Z"/></svg>`
  },
  {
    id: 7,
    softName: 'windows',
    softPath: 'prod/windows.json',
    softFont: `<svg viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg" height="80" width="80"><path d="m0 12.402 35.687-4.86.016 34.423-35.67.203zm35.67 33.529.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349-.011 41.34-47.318-6.678-.066-34.739z" fill="#00adef"/></svg>`
  }
])

let shortcutList = reactive({})

const shortcutShow = ref<boolean>(false)
const hideShortcuts = () => {
  shortcutShow.value = false
}

const openShortcutBox = async (index: number) => {
  const data = await win.myApi.readShortcutsFile(keyArray[index].softPath)
  shortcutList = data
  shortcutShow.value = true
}

const commit = (key: string, index: string) => {
  console.info(key, index)
  console.info(shortcutList[key][index])
  let userKeyStr: string = ''
  let keyValue = shortcutList[key][index].keyValue
  let keyCount: number = 0
  keyValue = keyValue.replace(/\+|\(.+\)|(?<=or).+|\\\s/g, '')
  // 特殊按键检测
  specialKeyStr.forEach((o, i) => {
    o.forEach((x) => {
      let reg = new RegExp(x, 'gi')
      if (reg.test(keyValue)) {
        // console.info(i)
        keyCount += specialKeyCode[i]
        userKeyStr += specialKeyStr[i][0] + ' + '
        keyValue = keyValue.replace(reg, '')
      }
    })
  })

  // 键值
  let keyValueStr: string = ``
  let valueCount: number = 0
  // 其他按键检测
  otherKey.forEach((o, i) => {
    o.word.forEach((x) => {
      let reg = new RegExp(x, 'gi')
      if (reg.test(keyValue)) {
        // console.info(i)
        keyValueStr += otherKey[i].hex
        userKeyStr += x + ' + '
        valueCount += 1
        keyValue = keyValue.replace(reg, '')
      }
    })
  })
  try {
    // 特殊字符检测
    for (let i = 0; i < keyValue.length; i++) {
      if (/[^a-zA-Z0-9\s]/.test(keyValue[i])) {
        // console.info(keyValue[i])
        keyValueStr += getStringMap().get(keyValue[i]).hex
        userKeyStr += keyValue[i] + ' + '
        valueCount += 1
      }
    }
    // 普通字符检测
    for (let i = 0; i < keyValue.length; i++) {
      if (/[A-Z0-9]/.test(keyValue[i])) {
        // console.info(keyValue[i])
        keyValueStr += getStringMap().get(keyValue[i]).hex
        userKeyStr += keyValue[i] + ' + '
        valueCount += 1
      }
    }
  } catch (error) {
    XBox.popMes('有错误产生，可能有不支持的字符')
    return
  }
  let genKeyStr: string = ''

  // 没有快捷键按普通按键处理
  if (keyCount == 0) {
    genKeyStr = `0${toHexStr(valueCount)}${keyValueStr}`
  } else {
    genKeyStr = `101${toHexStr(keyCount)}${toHexStr(valueCount)}${keyValueStr}`
  }

  userKeyStr = userKeyStr.replace(/\+\s$/, '')
  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr
  }
  // console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="pre-shortcuts-content">
    <ul>
      <li v-for="(v, k) in keyArray" :key="v.id" class="soft-icon" @click="openShortcutBox(k)">
        <div v-html="v.softFont"></div>
      </li>
    </ul>
    <div id="shortcuts-box" v-if="shortcutShow">
      <ul>
        <li v-for="(v, k, i) in shortcutList" :key="v">
          <div class="list-trans-name">{{ shortcutList['toolTrans'][i] }}</div>
          <div class="list-ori-name">{{ k }}</div>
          <ul>
            <li v-for="(value, index) in v" :key="value" @click="commit(k, index)">
              <div class="shortcut-key-box">
                <div class="box1">
                  {{ value.keyTrans }}
                </div>
                <div class="box2">
                  {{ value.keyName }}
                </div>
                <div class="box3">
                  {{ value.keyValue }}
                </div>
                <div class="line"></div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div id="cover" v-if="shortcutShow" @click="hideShortcuts"></div>
  </div>
</template>

<style lang="scss" scoped>
.hover {
  background: rgba(51, 51, 51, 0.8) !important;
  color: rgba(255, 255, 255, 1) !important;
}
#pre-shortcuts-content {
  @include wh(75%, 50%, 700px, 500px, 670px);
  @include ab_center;
  z-index: 66;
  @include style_common(25px, rgba(255, 255, 255, 1));
  ul {
    @include full_wh;
    // margin-right: 10px;
    @include flex_config(0, flex-start, wrap);
    align-items: flex-start;
    overflow: scroll;
    padding: 1.2em;
    li {
      @include wh(19%, 120px);
      margin: 0.92em;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
      @include style_common(12px);
      @include flex_center;
      font-size: 20px;
      transition: all 0.3s ease-in-out;
      span {
        text-align: center;
      }
    }
    .soft-icon:hover {
      transform: scale(1.2);
    }
  }
  #pre-shortcuts-content #commit-box {
    @include wh(120px, 50px);
    @include pos_ab(20px, 20px, 2);
    @include style_common(12px, rgba(210, 168, 169, 1));
    cursor: pointer;
    @include flex_center;
    @include font_config(20px, rgba(255, 255, 255, 1));
  }
}
#shortcuts-box {
  @include wh(72%, 180%);
  @include style_common(25px, rgba(255, 255, 255, 1), null, $shadow1);
  @include fixed_center;
  z-index: 88;
  > ul {
    @include full_wh;
    overflow-y: scroll;
    @include flex_config(1, flex-start);
    padding: 1em;
    > li {
      width: 100%;
      height: auto;
      @include flex_config(1, space-between);
      align-items: flex-start;
      @include style_common(25px, rgba(255, 255, 255, 1), null, $shadow1);
      padding: 1em;
      .list-trans-name {
        @include font_config(42px, rgba(51, 51, 51, 0.7));
      }
      .list-ori-name {
        @include font_config(32px, rgba(51, 51, 51, 0.5));
        margin-bottom: 10px;
      }
      ul {
        @include full_wh;
        padding: 0.3em;
        li {
          @include wh(100%, auto);
          @include flex_config(0, flex-start);
          // align-items: flex-end;
          margin: 0;
          padding: 0;
        }
      }
    }
  }
}
.shortcut-key-box {
  @include wh(100%, auto);
  @include flex_config(1, space-around);
  align-items: flex-end;
  margin: 1.3em 0;
  position: relative;
  div {
    margin: 0.3em 0;
    @include font_config(30px);
  }
  .box2 {
    @include font_config(20px, rgba(51, 51, 51, 0.7));
  }
  .box3 {
    @include font_config(40px, rgb(250, 206, 203));
  }
  .line {
    @include wh(100%, 1px);
    @include pos_ab(-20px, 0px, 2);
    @include style_common(25px, rgba(51, 51, 51, 0.2));
  }
}
#cover {
  @include full_wh;
  @include fixed_center;
  @include style_common(25px, rgba(51, 51, 51, 0.25));
  z-index: 66;
  position: fixed;
}
</style>
