import {findAdded, findRemoved} from './form-with-sins.directive'

describe(`findAdded`, () => {
  it(`should find correct diff`, () => {
    expect(findAdded([[1, 2, 3], [2, 3, 4]])).toEqual([4])
  })

  it(`should work when diff is empty`, () => {
    expect(findAdded([[1, 2, 3], [1, 2, 3]])).toEqual([])
  })

  it(`should work when diff is whole array`, () => {
    expect(findAdded([[1, 2, 3], [4, 5, 6]])).toEqual([4, 5, 6])
  })

  it(`should work when the first of pair is empty`, () => {
    expect(findAdded([[], [1, 2, 3]])).toEqual([1, 2, 3])
  })

  it(`should work when the second of pair is empty`, () => {
    expect(findAdded([[1, 2, 3], []])).toEqual([])
  })
})

describe(`findRemoved`, () => {
  it(`should find correct diff`, () => {
    expect(findRemoved([[1, 2, 3], [2, 3, 4]])).toEqual([1])
  })

  it(`should work when diff is empty`, () => {
    expect(findRemoved([[1, 2, 3], [1, 2, 3]])).toEqual([])
  })

  it(`should work when diff is whole array`, () => {
    expect(findRemoved([[1, 2, 3], [4, 5, 6]])).toEqual([1, 2, 3])
  })

  it(`should work when the first of pair is empty`, () => {
    expect(findRemoved([[], [1, 2, 3]])).toEqual([])
  })

  it(`should work when the second of pair is empty`, () => {
    expect(findRemoved([[1, 2, 3], []])).toEqual([1, 2, 3])
  })
})
