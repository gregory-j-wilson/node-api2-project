const db = require('../db')

const express = require('express');

const router = express.Router();


router.post('/', async (req, res) => {


    try {
        let posts

        await db.find()
            .then(resp => {
                posts = resp
            })


        const newPost = req.body;

        if (!req.body.title || !req.body.contents) {
            res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
        }
        posts.push(newPost);

        res.status(201).json(posts)
    } catch (error) {
        res.status(500).json({ errorMessage: "There was an error while saving the user to the database" })
    }

})




router.post('/:id/comments', async (req, res) => {
    try {

        const id = Number(req.params.id)
        await db.findById(id)
            .then(post => {
                const isPostFound = post.length > 0
                if (!isPostFound) {
                    res.status(404).json({ message: "The post with the specified ID does not exist." })
                }
            })

        const newComment = req.body

        if (!req.body.text) {
            res.status(400).json({ errorMessage: "Please provide text for the comment." })
        }

        await db.insertComment(newComment)
            .then((commentIdObject) => {
                db.findCommentById(commentIdObject.id)
                    .then(updatedComment => {
                        res.status(201).json(updatedComment)
                    })
            })



        // if (!newComment) {
        //     res.status(404).json({ message: "The post with the specified ID does not exist." })
        // }

        // res.status(201).json(newComment)
    } catch (error) {
        res.status(500).json({ errorMessage: "There was an error while saving the comment to the database" })
    }

})





router.get('/', (req, res) => {
    try {

        db.find()
            .then(posts => {
                console.log(posts)
                res.status(200).json(posts)
            })

    } catch (error) {
        res.status(500).json({ errorMessage: "The posts information could not be retrieved." })
    }
})



router.get('/:id', async (req, res) => {
    try {
        let post

        await db.findById(req.params.id)
            .then(resp => {
                post = resp
            })


        if (!post.length) {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
        }   // make this work....

        res.status(200).json(post)
    } catch {
        res.status(500).json({ errorMessage: "The post information could not be retrieved." })
    }
})



router.get('/:id/comments', async (req, res) => {
    try {

        const id = Number(req.params.id)

        await db.findById(id)
            .then(post => {
                const isPostNotFound = post.length === 0
                if (isPostNotFound) {
                    res.status(404).json({ message: "The post with the specified ID does not exist." })
                }
            })

        db.findPostComments(id)
            .then(comments => {
                const noComments = comments.length === 0

                if (noComments)  res.status(404).json({ message: "The post with the specified ID does not exist." })
                    
                res.status(200).json(comments)
                })

                
    } catch (error) {
        res.status(500).json({ errorMessage: "The comments information could not be retrieved." })
    }
})





router.delete('/:id', (req, res) => {  // have to click twice to get it to show deletion... ??
    try {

            db.remove(req.params.id)
            .then((resp) => {
                if (!resp) {
                    res.status(404).json({ message: "The post with the specified ID does not exist." })
                }  
                res.status(204).end()
            })
            


    } catch {
        res.status(500).json({ errorMessage: "The post could not be removed." })
    }
})


router.put('/:id', async (req, res) => {
    // const changes = req.body
    // const id = Number(req.params.id);

    try {
        await db.update(req.params.id, req.body)
            .then(resp => {
                console.log(`${resp} updated records`)
            })


        if (!req.body.title || !req.body.contents) {
            res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
        }

        if (!req.params.id) {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
        }

        res.status(200).json(req.body)

    } catch (error) {
        res.status(500).json({ errorMessage: "The post information could not be modified." })
    }
})



module.exports = router
