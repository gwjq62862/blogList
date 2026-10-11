import { test, describe } from 'node:test'
import assert from 'node:assert'
import listHelper from './utils/list_helper.js'

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})



describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('find the blog with most likes', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, listWithOneBlog[0])
  })


  test('finding the most blogs author', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    const expected = { author: 'Edsger W. Dijkstra', blogs: 1 }
    assert.deepStrictEqual(result, expected)
  })

  test('finding the most likes author ', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    const expected = { author: 'Edsger W. Dijkstra', likes: 5 }
    assert.deepStrictEqual(result, expected)
  })
})


