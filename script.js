'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////


const createUsernames = function(accounts){
  accounts.forEach(acc=> acc.username = acc.owner.toLowerCase().split(" ").map(name=>name[0]).join(""))
}
createUsernames(accounts)


const movementsDates = function(date , locale){
  const now = Date.now()
  date = new Date(date)
  const daysDiff = (Number(now)-Number(date))/(1000*60*60*24)


  if (daysDiff<=1) {return "Today"}
  else if (daysDiff<=2) {return "Yesterday"}
  else if (daysDiff<= 7) {return `${Math.trunc(daysDiff)} Days ago`}
  else {
    const dateToPrint = new Intl.DateTimeFormat(locale).format(date)
    return dateToPrint
  }

}

const currencyFormat = function(unit, locale){
  const options ={style:"currency", currency:unit}
  const formatter = new Intl.NumberFormat(locale, options)
  return formatter
}


const displayMovements= function(movements , sort=false){
    containerMovements.innerHTML=null;
    const movs = sort?  movements.toSorted(): movements
    console.log(movs)
    movs.forEach(function(movement, idx){
      const type = movement>0 ? 'deposit' : 'withdrawal';
      const date = currentAccount.movementsDates[idx]

      
      const html_template = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${idx+1} ${type}
        </div>
        <div class="movements__date">${movementsDates(date, currentAccount.locale)}</div>
        <div class="movements__value">${currencyFormat(currentAccount.currency ,currentAccount.locale).format(movement)}</div>
      </div>
      `
      containerMovements.insertAdjacentHTML('afterbegin', html_template)
    });
}


const displayBalance = function(acc){
  const balance = acc.movements.reduce((acc, mov)=>acc+=mov, 0)
  accounts.forEach(acc => acc.balance = balance)
  labelBalance.textContent=`${currencyFormat(currentAccount.currency ,currentAccount.locale).format(balance)}`
}

const displaySummary = function(acc){
  const summary = acc.movements.reduce((acc, mov)=> {
    if (mov>0){
      const val = acc.shift()
      acc.unshift(val+mov)
      return acc
    }
    else {
      const val = acc.pop()
      acc.push(val+mov)
      return acc
    }
  },[0,0])

  // interest = deposit × (interestRate / 100)
  const interest = acc.movements.filter(mov=>mov>0).map(mov=>mov*(acc.interestRate/100)).filter(int=>int>=1).reduce((acc, int)=> acc+=int) 

  labelSumIn.textContent=`${currencyFormat(currentAccount.currency ,currentAccount.locale).format(summary[0])}`
  labelSumOut.textContent=`${currencyFormat(currentAccount.currency ,currentAccount.locale).format(summary[0])}`
  labelSumInterest.textContent=`${currencyFormat(currentAccount.currency ,currentAccount.locale).format(interest)}`

}


const updateUI = function(acc , sort=false){
  displayMovements(acc.movements, sort)
  displayBalance(acc)
  displaySummary(acc)
}

const countDownTimer = function(){
  const tick = function(){
    const min = String(Math.trunc(time/60)).padStart(2,0)
    const sec = String((time%60)).padStart(2,0)
    labelTimer.textContent = `${min}:${sec}`;
    if (time===0){
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  }

  let time = 300
  tick()
  const timer = setInterval(tick, 1000)
  return timer;
}


let currentAccount, timer;
btnLogin.addEventListener('click',function(e){
  e.preventDefault()

  const date =new Date()
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  labelDate.textContent = `${day}/${month}/${year}`

  currentAccount = accounts.find( acc => acc?.username===inputLoginUsername.value)
  if (currentAccount?.pin === Number(inputLoginPin.value)){
    containerApp.style.opacity=100;
  }

  labelWelcome.textContent= `Welcome back, ${currentAccount.owner.split(' ')[0]}`
  
  inputLoginUsername.value=null
  inputLoginPin.value=null
  updateUI(currentAccount)
  if (timer) clearInterval(timer);
  timer = countDownTimer();
  
})

let sort =false;
btnSort.addEventListener('click', function() {
  sort = !sort
  updateUI(currentAccount, sort)
})



btnTransfer.addEventListener('click',function(e){
  e.preventDefault()
  const transferToAcc = accounts.find(acc => acc.username === inputTransferTo.value)
  const transferAmount =  Number( inputTransferAmount.value)

  if (transferToAcc !== currentAccount && transferToAcc && transferAmount>0 && transferAmount<= currentAccount.balance) {
    inputTransferTo.value=null
    inputTransferAmount.value=null
    currentAccount.movements.push(-transferAmount)
    currentAccount.movementsDates.push(Date.now())

    transferToAcc.movements.push(transferAmount)
    transferToAcc.movementsDates.push(Date.now())

    updateUI(currentAccount)

    // Reset timer
    clearInterval(timer);
    timer = countDownTimer();
  }
})

btnLoan.addEventListener('click', function(e){
  e.preventDefault()
  const loan = Number(inputLoanAmount.value)
  if (loan > 0 && currentAccount.movements.some(mov => mov >= loan * 0.1)){
    inputLoanAmount.value= null
    setTimeout(()=> {
      currentAccount.movements.push(loan)
      currentAccount.movementsDates.push(Date.now())
      updateUI(currentAccount)
      
    }, 5000)
    
    // Reset timer
    clearInterval(timer);
    timer = countDownTimer();
  }
  
})


btnClose.addEventListener('click', function(e){
  e.preventDefault()

  const username = inputCloseUsername.value
  const pin = Number(inputClosePin.value)

  inputCloseUsername.value=null
  inputClosePin.value=null

  if (username === currentAccount.username && pin === currentAccount.pin){
    const idx = accounts.findIndex(acc => acc.username === username)
    const deletedAcc = accounts.splice(idx, 1)
    console.log(deletedAcc)
    containerApp.style.opacity = 0;

    labelWelcome.textContent= "Log in to get started"
    clearInterval(timer);
  }
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////

// coding challenges

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////


// /////////////////////////////////////////////////

// // Coding Challenge #1

// /* 
// Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

// Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

// 1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of 
//   Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
// 2. Create an array with both Julia's (corrected) and Kate's data
// 3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
// 4. Run the function for both test datasets

// HINT: Use tools from all lectures in this section so far 😉

// TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
// TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */

// const dogsJulia1 = [3, 5, 2, 12, 7]
// const dogsKate1 = [4, 1, 15, 8, 3]



// const dogsJulia2 = [9, 16, 6, 8, 3]
// const dogsKate2 = [10, 5, 6, 1, 4]


// const checkDogs = function(dogsJulia, dogsKate){
//   const dogsJulia_clone= [...dogsJulia]
//   dogsJulia_clone.splice(0,1)
//   dogsJulia_clone.splice(-1,1)

//   const both_dogs= dogsJulia_clone.concat(dogsKate)
//   both_dogs.forEach((dog,i) => {
//     if (dog >= 3){
//       console.log(`Dog number ${i+1} is an adult, and is ${dog} years old`)
//     } else {
//       console.log(`Dog number ${i+1} is still a puppy 🐶`)
//     }
//   })

// }

// console.log("=========")
// checkDogs(dogsJulia1,dogsKate1)
// console.log("=================")
// checkDogs(dogsJulia2,dogsKate2)








// ///////////////////////////////////////
// // create array of all witdrawal of all accounts

// console.log("=================")
// const result = accounts.map(function(acc){
//   const withdrawal= acc.movements.filter(function(mov){
//     return mov<0
//   })
//   return withdrawal
// })

// console.log(result)


// ///////////////////////////////////////
// // Coding Challenge #2

// /* 
// Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average
//  age of the dogs in their study.

// Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

// 1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. 
//   If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
// 2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
// 3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
// 4. Run the function for both test datasets

// TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
// TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */



// console.log("=================")

// const calcAverageHumanAge = function(dogs){
//   const ages = dogs.map(function(dog){
//     return dog>2 ? 16 + dog * 4 : 2 * dog
//   })
//   const adults= ages.filter(function(age){
//     return age>=18;
//   })
//   const average = adults.reduce(function(acc, age){
//     return acc+age
//   },0) / adults.length
//   return average
// }

// console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]))




// ///////////////////////////////////////
// // Coding Challenge #3

// /* 
// Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

// TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
// TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */

// console.log("=================")
// const calcAverageHumanAge2 = function(dogs){
//   const ages = dogs.map(dog => dog>2 ? 16 + dog * 4 : 2 * dog
//   ).filter(age => age>=18
//   ).reduce((acc, age, i , arr) => acc+(age/arr.length) ,0)
//   return ages
// }

// console.log(calcAverageHumanAge2([5, 2, 4, 1, 15, 8, 3]))



// ///////////////////////////////////////
// // Implement the following with the forEach()

// const account = accounts.find(acc => acc.owner==="Jonas Schmedtmann")
// console.log(account)

// let res
// accounts.forEach(acc=>{
//   if (acc.owner==="Jonas Schmedtmann") res = acc
// })
// console.log(res)


// ///////////////////////////////////////
// // Coding Challenge #4

// /*
// This time, Julia and Kate are studying the activity levels of different dog breeds.

// YOUR TASKS:
// 1. Store the the average weight of a "Husky" in a variable "huskyWeight"
// 2. Find the name of the only breed that likes both "running" and "fetch" ("dogBothActivities" variable)
// 3. Create an array "allActivities" of all the activities of all the dog breeds
// 4. Create an array "uniqueActivities" that contains only the unique activities (no activity repetitions). HINT: Use a technique with a special data structure that we studied a few sections ago.
// 5. Many dog breeds like to swim. What other activities do these dogs like? Store all the OTHER activities these breeds like to do, in a unique array called "swimmingAdjacent".
// 6. Do all the breeds have an average weight of 10kg or more? Log to the console whether "true" or "false".
// 7. Are there any breeds that are "active"? "Active" means that the dog has 3 or more activities. Log to the console whether "true" or "false".

// BONUS: What's the average weight of the heaviest breed that likes to fetch? HINT: Use the "Math.max" method along with the ... operator.

// TEST DATA:
// */

// console.log("++++++++++++++++++++++++++++++++++++++")
// const breeds = [
//   {
//     breed: 'German Shepherd',
//     averageWeight: 32,
//     activities: ['fetch', 'swimming'],
//   },
//   {
//     breed: 'Dalmatian',
//     averageWeight: 24,
//     activities: ['running', 'fetch', 'agility'],
//   },
//   {
//     breed: 'Labrador',
//     averageWeight: 28,
//     activities: ['swimming', 'fetch'],
//   },
//   {
//     breed: 'Beagle',
//     averageWeight: 12,
//     activities: ['digging', 'fetch'],
//   },
//   {
//     breed: 'Husky',
//     averageWeight: 26,
//     activities: ['running', 'agility', 'swimming'],
//   },
//   {
//     breed: 'Bulldog',
//     averageWeight: 36,
//     activities: ['sleeping'],
//   },
//   {
//     breed: 'Poodle',
//     averageWeight: 18,
//     activities: ['agility', 'fetch'],
//   },
// ];

// // 1. Store the the average weight of a "Husky" in a variable "huskyWeight"
// const huskyWeight = (breeds.find(breed => breed.breed==='Husky')).averageWeight
// console.log (huskyWeight)

// // 2. Find the name of the only breed that likes both "running" and "fetch" ("dogBothActivities" variable)
// const dogBothActivities = breeds.find(breed => breed.activities.includes('running')&&breed.activities.includes('fetch')).breed
// console.log(dogBothActivities)

// // 3. Create an array "allActivities" of all the activities of all the dog breeds
// const allActivities = breeds.flatMap(breed => breed.activities)
// console.log(allActivities)


// // 4. Create an array "uniqueActivities" that contains only the unique activities (no activity repetitions). HINT: Use a technique with a special data structure that we studied a few sections ago.
// const uniqueActivities = [... new Set (allActivities) ]
// console.log(uniqueActivities)

// // 5. Many dog breeds like to swim. What other activities do these dogs like? Store all the OTHER activities these breeds like to do, in a unique array called "swimmingAdjacent".

// // this is wrongg
// // const swimmingAdjacent = breeds.flatMap(breed => {
// //   if (breed.activities.some(act=> act==='swimming')){
// //     return breed.activities.filter(act => act!=='swimming')
// //   }
// // })

// // this is the correct one
// const swimmingAdjacent =[... new Set( breeds.filter(breed => breed.activities.includes("swimming"))
// .flatMap(breed => breed.activities.filter(act => act!=='swimming')))]
// console.log(swimmingAdjacent)


// // 6. Do all the breeds have an average weight of 10kg or more? Log to the console whether "true" or "false".
// console.log(breeds.every(breed => breed.averageWeight>=10 ))


// // 7. Are there any breeds that are "active"? "Active" means that the dog has 3 or more activities. Log to the console whether "true" or "false".
// console.log(breeds.some(breed => breed.activities.length>=3))


// // BONUS: What's the average weight of the heaviest breed that likes to fetch? HINT: Use the "Math.max" method along with the ... operator.
// const likeToFetch = breeds.filter(breed => breed.activities.includes('fetch'))
// const avgWeightOfHeaviest = likeToFetch.reduce((acc, breed)=>
// {
//   if (breed.averageWeight > acc.averageWeight) return breed
//   else return acc
// }, likeToFetch[0])

// // console.log(likeToFetch)
// console.log(avgWeightOfHeaviest.averageWeight)


// console.log("++++++++++++++++++++++++++++++++++++++")




// ///////////////////////////////////////
// // Coding Challenge #5

// /* 
// Julia and Kate are still studying dogs. This time they are want to figure out if the dogs in their are eating too much or too little food.

// - Formula for calculating recommended food portion: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
// - Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
// - Eating an okay amount means the dog's current food portion is within a range 10% above and below the recommended portion (see hint).

// YOUR TASKS:
// 1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion (recFood) and add it to the object as a new property. Do NOT create a new array, simply loop over the array (We never did this before, so think about how you can do this without creating a new array).
// 2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple users, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
// 3. Create an array containing all owners of dogs who eat too much (ownersTooMuch) and an array with all owners of dogs who eat too little (ownersTooLittle).
// 4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
// 5. Log to the console whether there is ANY dog eating EXACTLY the amount of food that is recommended (just true or false)
// 6. Log to the console whether ALL of the dogs are eating an OKAY amount of food (just true or false)
// 7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
// 8. Group the dogs into the following 3 groups: 'exact', 'too-much' and 'too-little', based on whether they are eating too much, too little or the exact amount of food, based on the recommended food portion.
// 9. Group the dogs by the number of owners they have
// 10. Sort the dogs array by recommended food portion in an ascending order. Make sure to NOT mutate the original array!

// HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
// HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

// TEST DATA:
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John', 'Leo'] },
//   { weight: 18, curFood: 244, owners: ['Joe'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// GOOD LUCK 😀
// */

// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John', 'Leo'] },
//   { weight: 18, curFood: 244, owners: ['Joe'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];



// // Formula for calculating recommended food portion: 
// // recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
// // 1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion (recFood) 
// // and add it to the object as a new property. Do NOT create a new array, simply loop over the array (We never did this before, so think about how you can do this without creating a new array).

// dogs.forEach(dog=>{
//   dog.recommendedFood= Math.floor(dog.weight ** 0.75 * 28)
// })
// console.log(dogs)


// // - Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
// // - Eating an okay amount means the dog's current food portion is within a range 10% above and below the recommended portion (see hint).
// // HINT 2: Being within a range 10% above and below the recommended portion means: 
// // current > (recommended * 0.90) && current < (recommended * 1.10). 
// // Basically, the current portion should be between 90% and 110% of the recommended portion.

// // 2. Find Sarah's dog and log to the console whether it's eating too much or too little. 
// // HINT: Some dogs have multiple users, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
// const SarahsDog = dogs.find(dog => dog.owners.includes('Sarah'))
// console.log( SarahsDog.curFood > (SarahsDog.recommendedFood * 0.90) && SarahsDog.curFood < (SarahsDog.recommendedFood * 1.10) ? 'Eating an okay amount' : SarahsDog.curFood > SarahsDog.recommendedFood ? 'Eating too much' : 'Eating too little')



// // 3. Create an array containing all owners of dogs who eat too much (ownersTooMuch) 
// // and an array with all owners of dogs who eat too little (ownersTooLittle).
// const ownersTooMuch = dogs.filter(dog => dog.curFood > dog.recommendedFood).flatMap(dog => dog.owners)
// const ownersTooLittle = dogs.filter(dog => dog.curFood < dog.recommendedFood).flatMap(dog => dog.owners)
// console.log(ownersTooMuch)
// console.log(ownersTooLittle)


// // 4. Log a string to the console for each array created in 3., like this: 
// // "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"

// // const ownersTooMuchSTRING = ownersTooMuch.reduce((acc, awn, idx ,arr) => {
// //   acc += awn
// //   if (idx !== arr.length-1) acc += " and "
// //   return acc
// // }, "")+"'s dogs eat too much!"
// const ownersTooMuchSTRING = ownersTooMuch.join(" and ")+"'s dogs eat too much!"
// console.log(ownersTooMuchSTRING)

// // const ownersTooLittleSTRING = ownersTooLittle.reduce((acc, awn, idx ,arr) => {
// //   acc += awn
// //   if (idx !== arr.length-1) acc += " and "
// //   return acc
// // }, "")+"'s dogs eat too little!"

// const ownersTooLittleSTRING = ownersTooLittle.join(" and ")+"'s dogs eat too little!"
// console.log(ownersTooLittleSTRING)



// // 5. Log to the console whether there is ANY dog eating EXACTLY the amount of food that is recommended (just true or false)
// console.log(dogs.some(dog => dog.curFood === dog.recommendedFood))

// // 6. Log to the console whether ALL of the dogs are eating an OKAY amount of food (just true or false)
// console.log(dogs.every(dog => dog.curFood > (dog.recommendedFood * 0.90) && dog.curFood < (dog.recommendedFood * 1.10)))


// // 7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
// const eatingOkayDogs = dogs.filter(dog=> dog.curFood > (dog.recommendedFood * 0.90) && dog.curFood < (dog.recommendedFood * 1.10) )
// console.log(eatingOkayDogs)

// // 8. Group the dogs into the following 3 groups: 'exact', 'too-much' and 'too-little'
// // , based on whether they are eating too much, too little or the exact amount of food, based on the recommended food portion.

// const {exact, too_much, too_little} = Object.groupBy(dogs, dog => dog.curFood > (dog.recommendedFood * 0.90) && dog.curFood < (dog.recommendedFood * 1.10) ? 'exact' : dog.curFood > dog.recommendedFood ? 'too_much' : 'too_little')
// console.log(exact)
// console.log(too_little)
// console.log(too_much)



// console.log('+++++++++++++++++++++')
// // 9. Group the dogs by the number of owners they have
// // const {one, two, three} = Object.groupBy(dogs, dog => dog.owners.length === 1 ? 'one' : dog.owners.length === 2 ? 'two' : 'three')
// // console.log(one)
// // console.log(two)
// // console.log(three)

// const ownersGrouped = Object.groupBy(dogs, dog => `${dog.owners.length}-owners`)
// console.log(ownersGrouped)



// // 10. Sort the dogs array by recommended food portion in an ascending order. Make sure to NOT mutate the original array!
// const sortedArr = dogs.toSorted((a,b) => a.recommendedFood - b.recommendedFood)
// console(sortedArr)