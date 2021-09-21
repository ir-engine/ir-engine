use std::ops::Add;

use ic_cdk::export::{
    candid::{CandidType, Deserialize},
    Principal,
};
use ic_cdk::*;
use ic_cdk_macros::*;
use ic_cdk::api::time;
use serde_json::{Value};


const PAGESIZE: usize = 25;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct PostPreUpgrade {
    pub user: Principal,
    pub text: String,
}
type WallPreUpgrade = Vec<PostPreUpgrade>;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Post {
    pub id: i128,
    pub timestamp: i128,
    pub user_id: String,
    pub text: String,
}
type Wall = Vec<Post>;

type LatestPostId = i128;

fn paginate(posts: Vec<&Post>, page: usize) -> Vec<&Post> {
    let start_index = posts.len() - ((page - 1) * PAGESIZE) - 1;
    let mut paginated_posts = Vec::new();
    let mut n: usize = 0;
    while n < PAGESIZE && n <= start_index {
        paginated_posts.push(posts[start_index - n]);
        n += 1;
    }
    paginated_posts
}


#[query]
fn wall(filter_json: String) -> Vec<&'static Post> {
    let wall_posts = storage::get::<Wall>();

    let filter: Value = serde_json::from_str(&filter_json).unwrap();

    // PASS 1, filter on user_id
    let pass1 = match filter["user_id"].is_string() {
        true => {
            wall_posts
            .iter()
            .filter_map(|p| match p.user_id == filter["user_id"] {
                true => Some(p),
                false => None
            })
            .collect::<Vec<&Post>>()
        },
        false => wall_posts.iter().map(|p| p).collect::<Vec<&Post>>()
    };

    // PASS 2, pagination
    match filter["page"].is_number() {
        true => {
            let page = filter["page"].as_i64().unwrap() as usize;
            paginate(pass1, page)
        },
        false => pass1.iter().map(|&p| p).collect()
    }
}

#[update]
fn write(text: String)  {
    let principal_id = ic_cdk::caller().to_string();
    let latest_post_id = storage::get_mut::<LatestPostId>();
    *latest_post_id = latest_post_id.add(1);

    let post = Post {
        id: *latest_post_id,
        timestamp: time() as i128,
        user_id: principal_id,
        text,
    };

    let wall = storage::get_mut::<Wall>();
    wall.push(post);
}

#[pre_upgrade]
fn pre_upgrade() {
    let wall = storage::get::<WallPreUpgrade>();
    storage::stable_save((wall,)).unwrap();
    return;
}

#[post_upgrade]
fn post_upgrade() {
    let wall = storage::get_mut::<Wall>();
    let latest_post_id = storage::get_mut::<LatestPostId>();

    let res:Result<(Vec<PostPreUpgrade>,), String> = storage::stable_restore();
    match res {
        Ok((old_posts,)) => {
            for old_post in old_posts {
                ic_cdk::println!("Upgrading post");
                *latest_post_id = latest_post_id.add(1);
                wall.push(Post {
                    id: *latest_post_id,
                    timestamp: time() as i128,
                    user_id: old_post.user.to_string(),
                    text: old_post.text
                });
            }
            return;
        }
        Err(_) => return
    }
}