module.exports = (uiModel) => {
  const featuredCommunityMemberCompleteName = uiModel.featuredCommunityMembers.map((communityMember) => communityMember.fullName).join(' & ')
  let featuredCommunityMemberIntro
  if (uiModel.featuredCommunityMembers.length > 1) {
    featuredCommunityMemberIntro = `This week's featured community members are ${featuredCommunityMemberCompleteName}.`
  } else {
    featuredCommunityMemberIntro = `This week's featured community member is ${featuredCommunityMemberCompleteName}.`
  }
  const featuredCommunityMemberTitle = uiModel.featuredCommunityMembers.length > 1 ? `Featured Community Members: ${featuredCommunityMemberCompleteName}` : `Featured Community Member: ${featuredCommunityMemberCompleteName}`
  const linkedInLinks = uiModel.featuredCommunityMembers.map((communityMember) => `https://www.linkedin.com/in/name[Connect with ${communityMember.firstName} on LinkedIn, role="medium button"]`).join('\n\n')
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

[#featured-community-member,hashtags=""]
== ${featuredCommunityMemberTitle}

${featuredCommunityMemberIntro}

featured::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[name="${featuredCommunityMemberCompleteName}"]

// featured community member(s) presentation

// linkedin link(s)
${linkedInLinks}

[#features-1,hashtags=""]
== Feature 1

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-2,hashtags=""]
== Feature 2

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-3,hashtags=""]
== Feature 3

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-4,hashtags=""]
== Feature 4

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-5,hashtags=""]
== Feature 5

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-6,hashtags=""]
== Feature 6

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-7,hashtags=""]
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
