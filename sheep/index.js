const sampleData = [
  { name: 'A', color: 'red' },
  { name: 'B', color: 'yellow' },
  { name: 'C', color: 'blue' },
  { name: 'D', color: 'orange' },
  { name: 'E', color: 'green' },
  { name: 'F', color: 'pink' },
]
const size = 30
const rows = 10
const cols = 10
const onGroupCount = 3
const group = 6
const layerCount = 6
const cellHtml = []
// Array.from(new Array(onGroupCount * group)) lenth 18 array如果不
//用》from 包裹会返回长度18的空数组，无法遍历，无法传参，有了。from 生成
//的数组会有undifind的数值
// const renderData = Array.from(new Array(onGroupCount * group)).map(
//   (v) => sampleData
// )
// const renderData = Array.from(new Array(onGroupCount * group)).map((v) => {
//   return sampleData.map((v) => ({ ...v }))
// })   生成的是Two-dimensional array
const renderData = Array.from(new Array(onGroupCount * group))
  .map((v) => {
    return sampleData.map((v) => ({ ...v }))
  })
  .flat()
  .sort((v) => Math.random() - 0.5) //.flat()拉成一维数组  .sort()顺序传参进行乱序排列
//Math.random() - 0.5 随机得到一个正数、负数或是 0，如果是正数则降序排列，如果是负数则升序排列，
//如果是 0 就不变，然后不断的升序或者降序，最终得到一个乱序的数组. 但是概率不是每次50%
// console.log(renderData)
//-----------------------------------------------------
//开始按层绘制 3loop 层； 行； 列
for (let ly = layerCount - 1; ly >= 0; ly--) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      //用mode去让135 246错开
      let pyStep = (ly + 1) % 2 === 0 ? size / 2 : 0
      //随机取卡牌
      let item = Math.random() > 0.7 && renderData.pop()
      if (item) {
        //html push 部分
        cellHtml.push(`<div class='item' onclick='move(this)' id='m${ly}-${i}-${j}'
      style='width:${size}px;height:${size}px;left:${size * j + pyStep}px;top:${
          size * i + pyStep
        }px; margin: 0 auto;background-color:${item.color}'>${item.name}</div>`)
      }
    }
  }
}
const main = document.querySelector('.main')
const moveList = document.querySelector('.move-list')

//.reverse 因为需要从上往下绘制
main.innerHTML = cellHtml.reverse().join('')
main.style.height = `${size * rows + size * 2}px`
main.style.wirght = `${size * cols}px`
moveList.style.height = `${size}px`
moveList.style.wirght = `${size * 6}px`
//---------------------------------------------------------
//计算出被遮住的card,并标注成暗色
const checkDisabled = () => {
  main.querySelectorAll('.item').forEach((v, i) => {
    const arr = v.id
      .substring(1)
      .split('-')
      .map((v) => Number(v))
    const isPy = (arr[0] + 1) % 2 === 0 //在246层
    // console.log(arr)
    for (let i = arr[0] + 1; i <= layerCount - 1; i++) {
      //246 偏移层
      const isPyB = (i + 1) % 2 === 0
      //说明都是偶数或都是奇数层，影响遮蔽的只有一个和他完全重合的
      if (isPy === isPyB) {
        const el = main.querySelector(`#m${i}-${arr[1]}-${arr[2]}`)
        if (el) {
          v.classList.add('disabled')
          break
        }
      }
      //元素本身246 对比的是135
      else if (isPy && !isPyB) {
        const result = [
          `${i}-${arr[1]}-${arr[2]}`,
          `${i}-${arr[1]}-${arr[2] + 1}`,
          `${i}-${arr[1] + 1}-${arr[2]}`,
          `${i}-${arr[1] + 1}-${arr[2] + 1}`,
        ].every((k) => {
          return !main.querySelector('#m' + k)
        })
        if (!result) {
          v.classList.add('disabled')
          break
        } else {
          v.classList.remove('disabled')
        }
      }
      //本身135 对比246
      else if (!isPy && isPyB) {
        const result = [
          `${i}-${arr[1]}-${arr[2]}`,
          `${i}-${arr[1]}-${arr[2] - 1}`,
          `${i}-${arr[1] - 1}-${arr[2]}`,
          `${i}-${arr[1] - 1}-${arr[2] - 1}`,
        ].every((k) => {
          return !main.querySelector('#m' + k)
        })
        if (!result) {
          v.classList.add('disabled')
          break
        } else {
          v.classList.remove('disabled')
        }
      }
    }
  })
}

//---------------------------
//点击卡牌，消除计算
let canMove = true
const move = (me) => {
  let left = moveList.offsetLeft
  let top = moveList.offsetTop
  if (!canMove || me.className.indexOf('disabled') >= 0) {
    return
  }
  canMove = false
  //判断盒子里有没有卡牌
  if (moveList.children.length > 0) {
    let el = moveList.lastElementChild
    left = el.offsetLeft + size
  }
  me.style.top = `${top}px`
  me.style.left = `${left}px`
  me.transitionNamesCount = 0
  me.ontransitionend = (e) => {
    me.transitionNamesCount++
    if (me.transitionNamesCount === 2) {
      //移动2次 left,top 才算完成
      moveEnd(me)
      canMove = true
    }
  }
}

//动画结束
const moveEnd = (me) => {
  me.ontransitionend = null
  me.setAttribute('onClick', '')
  moveList.appendChild(me)
  const findResult = [...moveList.children].filter(
    (v) => v.innerHTML === me.innerHTML
  )
  if (findResult.length === 3) {
    findResult.forEach((v) => {
      v.ontransitionend = () => {
        moveList.removeChild(v)
        ;[...moveList.children].forEach((v, i) => {
          v.style.left = `${i * size + moveList.offsetLeft}px`
        })
      }
      setTimeout(() => {
        v.style.transform = 'scale(0)'
      })
    })
  }
  if (moveList.children.length === 6) {
    alert('game over')
    return location.reload()
  } else if (main.children.length === 0) {
    alert('pass!')
    return location.reload()
  }
  checkDisabled()
}

checkDisabled()
