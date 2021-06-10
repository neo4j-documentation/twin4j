module.exports = (uiModel) => {
  return `= This Week in Neo4j -
// update slug according to the blog post title, slug must only contain lowercase alphanumeric words separated by dashes, e.g. "this-week-in-neo4j-twitchverse-java-drivers-encryption"
:slug: this-week-in-neo4j-
:noheader:
:linkattrs:
:categories: ${uiModel.categories}
:author: ${uiModel.author}
// twin4j is added automatically
:tags:

Hello, everyone!

// introduction

[[featured-community-member]]
== Featured Community Member: ${uiModel.featuredCommunityMember.fullName}

This week's featured community member is ${uiModel.featuredCommunityMember.fullName}.

featured::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[name="${uiModel.featuredCommunityMember.fullName}"]

// featured community member presentation

// linkedin link
https://www.linkedin.com/in/name[Connect with ${uiModel.featuredCommunityMember.firstName} on LinkedIn, role="medium button"]

[[features-1]]
== Feature 1

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[[features-2]]
== Feature 2

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[[features-3]]
== Feature 3

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[[features-4]]
== Feature 4

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[[features-5]]
== Feature 5

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[[features-6]]
== Feature 6

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[[features-7]]
== Feature 7

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

== Tweet of the Week

My favorite tweet this week was by https://twitter.com/handle[name^]:

tweet::tweet-id[]

Don't forget to RT if you liked it too!
`
}
