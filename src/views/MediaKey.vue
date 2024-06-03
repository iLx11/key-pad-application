<script setup lang="ts">
import { reactive } from "vue";
import { toHexStr } from "../utils/strTools"
import { useConfigStore } from '../stores/configStore'

const configStore = useConfigStore()

const mediaKeyArray = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
const mediaArray = reactive([
  {
    mediaId: 0,
    mediaName: '减小音量',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.215 3.215 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68.21 68.21 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.314 2.314 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.215 3.215 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17.127 17.127 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z"/><path stroke-linecap="round" d="M20 6s1.5 1.8 1.5 6s-1.5 6-1.5 6" opacity=".4"/><path stroke-linecap="round" d="M18 9s.5.9.5 3s-.5 3-.5 3" opacity=".7"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 1,
    mediaName: '增大音量',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.215 3.215 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68.21 68.21 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.314 2.314 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.215 3.215 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17.127 17.127 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z"/><path stroke-linecap="round" d="M20 6s1.5 1.8 1.5 6s-1.5 6-1.5 6m-2-9s.5.9.5 3s-.5 3-.5 3"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 2,
    mediaName: '静音/取消',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none"><path fill="currentColor" d="M16.25 12a.75.75 0 0 0-1.5 0zM7.016 6.958l.125.74zM8.6 6.22l-.413-.626zm-.871.524l.303.687zM3.34 16.723l-.315.68zm-1.805-3.695l-.749.046zm.424 2.395l.66-.356zM13.7 20.075l-.242-.71zm1.713-5.47l.749.035zM14.28 19.78l.43.613zM8.818 6.076l.413.626zM13.7 3.925l-.242.71zm.58.295l.43-.614zM3.34 7.277l-.315-.68zm-1.805 3.694l-.749-.045zm.424-2.394l.66.356zm7.952 9.168A.75.75 0 0 0 9.09 19zM9.012 6.846l.22-.144l-.827-1.252l-.219.144zm-6.729 6.137c-.02-.347-.033-.68-.033-.983H.75c0 .341.014.706.036 1.074zM2.25 12c0-.303.012-.636.033-.983l-1.497-.091A17.87 17.87 0 0 0 .75 12zm12.5 0c0 .512-.034 1.45-.086 2.57l1.498.07A68.23 68.23 0 0 0 16.25 12zM6 7.75c.488 0 .817.002 1.141-.053l-.25-1.479c-.171.03-.354.032-.89.032zm2.186-2.156c-.447.295-.602.394-.76.464l.605 1.373c.3-.133.574-.316.981-.585zM7.141 7.697a3.75 3.75 0 0 0 .89-.266l-.606-1.373c-.17.076-.35.13-.534.16zM6.001 17.75c.536 0 .719.002.89.031l.25-1.479c-.324-.055-.653-.052-1.14-.052zm0-1.5c-1.445 0-1.932-.017-2.346-.208l-.63 1.361c.784.363 1.67.347 2.975.347zM.785 13.074c.07 1.153.104 1.947.512 2.704l1.32-.711c-.217-.405-.258-.82-.335-2.084zm2.869 2.968a2.47 2.47 0 0 1-1.036-.975l-1.32.711a3.962 3.962 0 0 0 1.726 1.625zm11.009-1.472c-.072 1.531-.123 2.603-.262 3.378c-.14.771-.337 1.066-.553 1.218l.862 1.227c.706-.496 1.005-1.28 1.167-2.18c.161-.895.215-2.086.284-3.573zm-.722 6.215a3.07 3.07 0 0 0 .769-.392l-.863-1.227a1.568 1.568 0 0 1-.39.199zM9.232 6.702c1.289-.85 2.194-1.445 2.908-1.792c.712-.346 1.069-.36 1.318-.275l.484-1.42c-.818-.28-1.631-.056-2.457.345c-.824.4-1.826 1.063-3.08 1.89zm4.226-2.067c.137.047.272.115.39.198l.863-1.227a3.066 3.066 0 0 0-.769-.39zM6 6.25c-1.304 0-2.19-.016-2.975.346l.63 1.362c.414-.192.901-.208 2.345-.208zm-3.717 4.767c.077-1.264.118-1.68.336-2.084l-1.32-.712C.89 8.979.855 9.772.785 10.926zm.742-4.42A3.962 3.962 0 0 0 1.298 8.22l1.32.712a2.47 2.47 0 0 1 1.037-.975zM9.089 19c1.039.68 1.899 1.224 2.631 1.549c.743.328 1.48.489 2.222.236l-.484-1.42c-.226.077-.54.074-1.13-.188c-.602-.266-1.358-.738-2.417-1.432zm7.034-10.46c-.06-1.227-.127-2.233-.296-3.01c-.172-.789-.477-1.474-1.116-1.924l-.863 1.227c.196.138.377.392.513 1.016c.139.635.202 1.514.264 2.765z"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M20 18s1.5-1.8 1.5-6c0-2.433-.503-4.061-.927-5M18 15s.5-.9.5-3c0-.862-.084-1.522-.183-2M22 2L2 22"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 3,
    mediaName: '播放/暂停',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2"/><path stroke-dasharray="4 3" stroke-linecap="round" d="M12 22C6.477 22 2 17.523 2 12S6.977 2 12.5 2" opacity=".5"/><path d="M15.414 10.941c.781.462.781 1.656 0 2.118l-4.72 2.787C9.934 16.294 9 15.71 9 14.786V9.214c0-.924.934-1.507 1.694-1.059z"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 4,
    mediaName: '下一首',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m11 19l6-7l-6-7"/><path d="m7 19l6-7l-6-7" opacity=".5"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 5,
    mediaName: '上一首',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m13 19l-6-7l6-7"/><path d="m17 19l-6-7l6-7" opacity=".5"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 6,
    mediaName: '停止',
    mediaSvg: '<svg t="1709637868357" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1486" width="40" height="40"><path d="M511.6 64.2C265.2 64.2 65.5 264 65.5 510.4s199.7 446.1 446.1 446.1 446.1-199.7 446.1-446.1S758 64.2 511.6 64.2z m0 831.2c-212.3 0-385.1-172.7-385.1-385.1s172.7-385.1 385.1-385.1S896.7 298 896.7 510.4s-172.8 385-385.1 385z" fill="#5c5c5c" p-id="1487" class="sweezy-custom-cursor-hover" style="null;cursor: url(&quot;data:image/png;base64,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&quot;) 7 1, pointer !important;"></path><path d="M694.8 479.8H328.4c-16.8 0-30.5 13.7-30.5 30.5s13.7 30.5 30.5 30.5h366.4c16.8 0 30.5-13.7 30.5-30.5 0.1-16.7-13.7-30.5-30.5-30.5z" fill="#5c5c5c" p-id="1488"></path></svg>',
    isHover: false
  },
  {
    mediaId: 7,
    mediaName: '本地浏览器',
    mediaSvg: '<svg t="1709639044307" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3773" width="40" height="40"><path d="M508.586667 836.266667c-81.92 0-160.426667-30.72-221.866667-88.746667-13.653333-13.653333-13.653333-34.133333 0-47.786667 13.653333-13.653333 34.133333-13.653333 47.786667 0 47.786667 44.373333 109.226667 68.266667 174.08 68.266667 23.893333 0 47.786667-3.413333 71.68-10.24 17.066667-3.413333 37.546667 6.826667 40.96 23.893333 6.826667 17.066667-6.826667 37.546667-23.893334 40.96-30.72 10.24-58.026667 13.653333-88.746666 13.653334z m310.613333-262.826667c3.413333-13.653333 3.413333-30.72 3.413333-44.373333 0-170.666667-139.946667-307.2-314.026666-307.2-119.466667 0-232.106667 68.266667-283.306667 174.08-6.826667 17.066667 0 37.546667 17.066667 44.373333 17.066667 6.826667 37.546667 0 44.373333-17.066667 40.96-81.92 129.706667-136.533333 221.866667-136.533333 136.533333 0 245.76 105.813333 245.76 238.933333 0 10.24 0 23.893333-3.413334 34.133334-3.413333 17.066667 10.24 37.546667 27.306667 37.546666h3.413333c20.48 3.413333 34.133333-6.826667 37.546667-23.893333z m98.986667 44.373333c3.413333-6.826667 3.413333-17.066667 3.413333-27.306666 0-17.066667-17.066667-30.72-37.546667-30.72-20.48 0-34.133333 20.48-30.72 37.546666-6.826667 23.893333-139.946667 54.613333-365.226666 0-170.666667-44.373333-286.72-112.64-314.026667-157.013333-3.413333-3.413333-3.413333-6.826667-3.413333-10.24 3.413333-17.066667-6.826667-37.546667-23.893334-40.96-17.066667-3.413333-37.546667 6.826667-40.96 23.893333-3.413333 13.653333-6.826667 37.546667 10.24 64.853334 40.96 71.68 180.906667 143.36 354.986667 187.733333 85.333333 20.48 174.08 34.133333 249.173333 34.133333 102.4 3.413333 184.32-20.48 197.973334-81.92z" fill="#5c5c5c" p-id="3774"></path></svg>',
    isHover: false
  },
  {
    mediaId: 8,
    mediaName: 'Calculator',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3.464 20.536C4.93 22 7.286 22 12 22c4.714 0 7.071 0 8.535-1.465C22 19.072 22 16.714 22 12s0-7.071-1.465-8.536C19.072 2 16.714 2 12 2S4.929 2 3.464 3.464C2 4.93 2 7.286 2 12c0 4.714 0 7.071 1.464 8.535Z"/><path stroke-linecap="round" d="M18 8.5h-4m4 6h-4m4 3h-4m-4-9H8m0 0H6m2 0v-2m0 2v2m1.5 4L8 16m0 0l-1.5 1.5M8 16l-1.5-1.5M8 16l1.5 1.5" opacity=".5"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 9,
    mediaName: 'Consumer Control',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none"><path stroke="currentColor" stroke-width="1.5" d="M5 9c0-2.809 0-4.213.674-5.222a4 4 0 0 1 1.104-1.104C7.787 2 9.19 2 12 2c2.809 0 4.213 0 5.222.674a4 4 0 0 1 1.104 1.104C19 4.787 19 6.19 19 9v6c0 2.809 0 4.213-.674 5.222a4.003 4.003 0 0 1-1.104 1.104C16.213 22 14.81 22 12 22c-2.809 0-4.213 0-5.222-.674a4.002 4.002 0 0 1-1.104-1.104C5 19.213 5 17.81 5 15z" opacity=".5"/><path stroke="currentColor" stroke-width="1.5" d="M15 15.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M9 5.5h6"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="12" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 10,
    mediaName: 'Email',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M10.5 22v-2m4 2v-2" opacity=".5"/><path fill="currentColor" d="M11 20v.75h.75V20zm3-.75a.75.75 0 0 0 0 1.5zm3.5-14a.75.75 0 0 0 0 1.5zM7 5.25a.75.75 0 0 0 0 1.5zm2 14a.75.75 0 0 0 0 1.5zm6 1.5a.75.75 0 0 0 0-1.5zm-4.75-9.5V20h1.5v-8.75zm.75 8H4.233v1.5H11zm-8.25-1.855V11.25h-1.5v6.145zm1.483 1.855c-.715 0-1.483-.718-1.483-1.855h-1.5c0 1.74 1.231 3.355 2.983 3.355zM6.5 6.75c1.967 0 3.75 1.902 3.75 4.5h1.5c0-3.201-2.246-6-5.25-6zm0-1.5c-3.004 0-5.25 2.799-5.25 6h1.5c0-2.598 1.783-4.5 3.75-4.5zm14.75 6v6.175h1.5V11.25zm-1.457 8H14v1.5h5.793zm1.457-1.825c0 1.12-.757 1.825-1.457 1.825v1.5c1.738 0 2.957-1.601 2.957-3.325zm1.5-6.175c0-3.201-2.246-6-5.25-6v1.5c1.967 0 3.75 1.902 3.75 4.5zM7 6.75h11v-1.5H7zm2 14h6v-1.5H9z"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M5 16h3"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M16 9.884V5.411m0 0V2.635c0-.236.168-.439.4-.484l.486-.093a3.2 3.2 0 0 1 1.755.156l.08.03c.554.214 1.16.254 1.737.115a.439.439 0 0 1 .542.427v2.221a.513.513 0 0 1-.393.499l-.066.016a3.199 3.199 0 0 1-1.9-.125a3.2 3.2 0 0 0-1.755-.156z" opacity=".5"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 11,
    mediaName: 'Home',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M12 15v3m10-5.796v1.521c0 3.9 0 5.851-1.172 7.063C19.657 22 17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.212C2 19.576 2 17.626 2 13.725v-1.521c0-2.289 0-3.433.52-4.381c.518-.949 1.467-1.537 3.364-2.715l2-1.241C9.889 2.622 10.892 2 12 2c1.108 0 2.11.622 4.116 1.867l2 1.241c1.897 1.178 2.846 1.766 3.365 2.715"/></svg>',
    isHover: false
  },
  {
    mediaId: 12,
    mediaName: 'Back',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="m11 8.071l-3.222 2.302a2 2 0 0 0 0 3.254L11 15.93m5.5-.872V8.943a1 1 0 0 0-1.581-.814l-4.28 3.057a1 1 0 0 0 0 1.628l4.28 3.057a1 1 0 0 0 1.581-.814Z"/><path d="M7 3.338A9.954 9.954 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-1.821.487-3.53 1.338-5"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 13,
    mediaName: 'Forward',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="m13 8.071l3.221 2.302a2 2 0 0 1 0 3.254L13 15.93m-5.5-.872V8.943a1 1 0 0 1 1.581-.814l4.28 3.057a1 1 0 0 1 0 1.628L9.08 15.87a1 1 0 0 1-1.581-.814Z"/><path d="M7 3.338A9.954 9.954 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-1.821.487-3.53 1.338-5"/></g></svg>',
    isHover: false
  },
  {
    mediaId: 14,
    mediaName: 'New',
    mediaSvg: '<svg t="1709651034607" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18276" data-spm-anchor-id="a313x.search_index.0.i19.7d7f3a81C0FgCE" width="40" height="40"><path d="M889.6 272l-758.4 0c-41.6 0-73.6 32-73.6 73.6l0 361.6c0 41.6 32 73.6 73.6 73.6l758.4 0c41.6 0 73.6-32 73.6-73.6l0-361.6C963.2 304 931.2 272 889.6 272zM320 646.4l-51.2 0-99.2-195.2 0 195.2-32 0 0-233.6 44.8 0 102.4 201.6 3.2 0 0-201.6 32 0L320 646.4zM400 512l124.8 0 0 32-124.8 0c0 3.2 0 3.2 0 6.4l0 0c0 41.6 12.8 60.8 38.4 60.8l89.6 0 0 32-89.6 0c-19.2 0-35.2-6.4-48-22.4-12.8-16-19.2-41.6-19.2-70.4 0-12.8 0-28.8 0-54.4 0-54.4 35.2-76.8 70.4-83.2l0 0c12.8 0 80 0 86.4 0l0 32c-28.8 0-73.6 0-83.2 0-12.8 3.2-41.6 12.8-41.6 51.2C400 502.4 400 505.6 400 512zM816 646.4l-44.8 0-44.8-185.6-51.2 185.6-48 0-67.2-233.6 35.2 0 57.6 192 3.2 0 51.2-192 38.4 0 51.2 201.6 60.8-201.6 32 0L816 646.4z" p-id="18277" class="sweezy-custom-cursor-hover selected" style="null;cursor: url(&quot;data:image/png;base64,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&quot;) 7 1, pointer !important;" data-spm-anchor-id="a313x.search_index.0.i20.7d7f3a81C0FgCE" fill="#5c5c5c"></path></svg>',
    isHover: false
  },
  {
    mediaId: 15,
    mediaName: 'Open',
    mediaSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M4 11.5V9m16 2.5V9.348c0-1.974 0-2.961-.616-3.603a2.318 2.318 0 0 0-.18-.168C18.52 5 17.469 5 15.363 5h-.3c-.922 0-1.384 0-1.814-.115a3.322 3.322 0 0 1-.678-.263c-.391-.204-.717-.51-1.37-1.122l-.44-.413a6.7 6.7 0 0 0-.443-.397a3.316 3.316 0 0 0-1.745-.677C8.424 2 8.27 2 7.96 2c-.706 0-1.06 0-1.353.052C5.312 2.281 4.3 3.23 4.055 4.444c-.03.153-.044.322-.05.556C4 5.188 4 5.417 4 5.712M10 17h4"/><path d="M10 11H8.705c-2.667 0-4 0-4.826.763a2.98 2.98 0 0 0-.54.67c-.578.977-.34 2.335.138 5.05c.343 1.956.515 2.934 1.11 3.582c.154.169.327.318.515.445c.723.49 1.683.49 3.603.49h6.59c1.92 0 2.88 0 3.603-.49c.188-.127.36-.276.515-.445c.595-.648.767-1.626 1.11-3.581c.477-2.716.716-4.074.138-5.051a2.978 2.978 0 0 0-.54-.67C19.296 11 17.962 11 15.295 11H14"/></g></svg>',
    isHover: false
  }
])

const setHover = (index: number) => {
  mediaArray[index].isHover = true
}

const resetHover = (index: number) => {
  mediaArray[index].isHover = false
}

const commit = (index: number) => {
  let genKeyStr: string = ''
  if(index > 7) {
    genKeyStr = `500${toHexStr(mediaKeyArray[index - 8])}`
  } else {
    genKeyStr = `5${toHexStr(mediaKeyArray[index])}00`
  }
  // console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: mediaArray[index].mediaName,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="media-key-content">
    <ul>
      <li v-for="(v, k) in mediaArray" :key="v.mediaId" @click="commit(k)" @mouseenter="setHover(k)" @mouseleave="resetHover(k)">
        <span v-if="v.isHover">{{ v.mediaName }}</span>
        <div v-if="!v.isHover" v-html="v.mediaSvg"></div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
#media-key-content {
  @include wh(70%, 60%, 600px, 500px);
  @include ab_center;
  z-index: 66;
  @include style_common(25px, rgba($color: #494c54, $alpha: 1));
  ul {
    @include full_wh;
    // margin-right: 10px;
    @include flex_config(0, flex-start, wrap);
    overflow: scroll;
    padding: 1.5em;
    li {
      width: 25%;
      height: 100px;
      margin: 4.1%;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
      @include style_common(12px, rgba(255, 255, 255, 1));
      @include flex_center;
      font-size: 20px;
      span {
        text-align: center;
      }
    }
  }
  #commit-box {
    width: 120px;
    height: 50px;
    @include pos_ab(20px, 20px, 2);
    @include style_common(12px, rgba(210, 168, 169, 1));
    cursor: pointer;
    @include flex_center;
    @include font_config(20px, rgba(255, 255, 255, 1));
  }
}
</style>
