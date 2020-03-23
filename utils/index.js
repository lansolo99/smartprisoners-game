// import { EventBus } from '@/bus'

/* =============================================
        Remove current 'active' class            
============================================= */
const removeCurrentDropzoneActiveClass = element => {
  const currentActiveDropzone = element.querySelectorAll('.dropzone.active')
  if (currentActiveDropzone.length) {
    currentActiveDropzone.forEach(element => {
      element.classList.remove('active')
    })
  }
}
export { removeCurrentDropzoneActiveClass }

/* ==============================================================
               Generate random letters
================================================================ */

const generateRandomLetter = () => {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
}

export { generateRandomLetter }

/* =============================================
  Get unique random integers serie from range
============================================= */
const getUniqueRandomInts = (maxRange, length) => {
  const picks = []
  // Store possibilities in the numbersArr array
  const numbersArr = []
  // n is the max number
  for (let i = 0; i < maxRange; i++) {
    numbersArr.push(i)
  }
  while (picks.length < length) {
    const randomIndex = Math.floor(Math.random() * numbersArr.length)
    picks.push(numbersArr[randomIndex])
    numbersArr.splice(randomIndex, 1)
  }
  return picks
}
export { getUniqueRandomInts }

/* =============================================
        Get random Integer from range
============================================= */
const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export { getRandomIntInclusive }

/* ==============================================================
                     Kill all active Timeouts
================================================================ */

const killTimeOuts = timeOuts => {
  for (let i = 0; i < timeOuts.length; i++) {
    clearTimeout(timeOuts[i])
  }
  // reset
  timeOuts.length = 0
}

export { killTimeOuts }

/* ==============================================================
                         Shuffle array
================================================================ */

const shuffleArray = array => {
  array.sort(() => Math.random() - 0.5)
  return array
}

export { shuffleArray }

/* ==============================================================
                  Get all combinations sums
================================================================ */

const getAllCombinationsSums = integer => {
  // Vars
  const target = integer
  const array = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9]
  const tmpArray = []
  const finalArray = []

  const sumUpRecursive = (numbers, number, partialArray) => {
    let s = 0
    partialArray.forEach(function(entry) {
      s = s + entry
    })
    if (s === target) {
      finalArray.push(partialArray)
    }
    if (s >= target) {
      return
    }
    for (let i = 0; i < numbers.length; i++) {
      const n = numbers[i]
      let remaining = []
      remaining = numbers.slice(i + 1)
      const particalArr = partialArray.slice()
      particalArr.push(n)
      sumUpRecursive(remaining, target, particalArr)
    }
  }

  sumUpRecursive(array, target, tmpArray)

  return finalArray
}

export { getAllCombinationsSums }

/* ==============================================================
           Generate array of number in a given range
================================================================ */

function rangeArray(start, end, step = 1) {
  const allNumbers = [start, end, step].every(Number.isFinite)

  if (!allNumbers) {
    throw new TypeError('range() expects only finite numbers as arguments.')
  }

  if (step <= 0) {
    throw new Error('step must be a number greater than 0.')
  }

  if (start > end) {
    step = -step
  }

  const length = Math.floor(Math.abs((end - start) / step)) + 1

  return Array.from(Array(length), (x, index) => start + index * step)
}

export { rangeArray }

/* ==============================================================
         Generate a random sum combination to a given max
================================================================ */

const getRandomCombinationSum = (max, arrayLength, integerLength = 1) => {
  function randombetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  function generate(max, arrayLength) {
    const r = []
    let currsum = 0
    for (let i = 0; i < arrayLength - 1; i++) {
      // r[i] = randombetween(1, max - (arrayLength - i - 1) - currsum)
      r[i] = randombetween(1, max - (arrayLength - i - 1) - currsum)
      currsum += r[i]
    }
    r[arrayLength - 1] = max - currsum
    return r
  }
  let evalCombination = generate(max, arrayLength)
  // generate(max, arrayLength).some(v => v.length < 2 ) ? '' : ''
  while (evalCombination.some(v => v.toString().length < integerLength)) {
    evalCombination = generate(max, arrayLength)
  }

  return evalCombination
}

export { getRandomCombinationSum }

/* ==============================================================
                Check if array has duplicates
================================================================ */

const hasDuplicates = array => {
  return new Set(array).size !== array.length
}

export { hasDuplicates }

/* ==============================================================
                Check if number is in range
================================================================ */

const numberBetween = (x, min, max) => {
  return x >= min && x <= max
}

export { numberBetween }
