function dummy(blogs) {
    return 1
}

function totalLikes(blogs) {
    if (blogs.length === 0) {
        return 0
    }


    return blogs.reduce((acc, cur) => acc + cur.likes, 0)
}

function favoriteBlog(blogs) {
    if (blogs.length === 0) {
        return null
    }


    return blogs.reduce((max, cur) => {
        return cur.likes > max.likes ? cur : max
    })
}



function mostBlogs(blogs) {
    if (blogs.length === 0) {
        return null
    }

    const counts = {}
    for (let blog of blogs) {

        counts[blog.author] = (counts[blog.author] || 0) + 1
    }


    let topAuthor = null
    let maxBlogs = 0


    for (const [author, blogsCount] of Object.entries(counts)) {
        if (counts[author] > maxBlogs) {
            maxBlogs = counts[author]
            topAuthor = author
        }
    }
    return { author: topAuthor, blogs: maxBlogs }
}



function mostLikes(blogs) {
    // we gotta took blogs.likes and author 
    //we gotta find maxium numbers of that likes
    if (blogs.length === 0) {
        return 0
    }

    const counts = {}
    for (let blog of blogs) {

        counts[blog.author] = (counts[blog.author] || 0) + blog.likes
    }

    let topAuthor = null
    let maxLikes = 0


    for (const [author, likes] of Object.entries(counts)) {
        if (likes > maxLikes) {
            maxLikes = likes
            topAuthor = author
        }
    }


    return { author: topAuthor, likes: maxLikes }

}


export default {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}