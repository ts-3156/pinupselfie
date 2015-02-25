require 'rails_helper'

RSpec.describe TweetsController, :type => :controller do

  # This should return the minimal set of attributes required to create a valid
  # Tweet. As you add validations to Tweet, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) {
    skip("Add a hash of attributes valid for your model")
  }

  let(:invalid_attributes) {
    skip("Add a hash of attributes invalid for your model")
  }

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # TweetsController. Be sure to keep this updated too.
  let(:valid_session) { {} }

  # describe "GET index" do
  #   it "assigns all tweets as @tweets" do
  #     tweet = Tweet.create! valid_attributes
  #     get :index, {}, valid_session
  #     expect(assigns(:tweets)).to eq([tweet])
  #   end
  # end

  describe "GET show" do
    let(:status_id) { 123 }
    let(:photo_id) { 456 }
    let(:invalid_photo_id) { 789 }
    let(:user) { Hash.new('') }
    let(:media) { [{id: photo_id}, {id: invalid_photo_id}] }
    let(:tweet) { Hashie::Mash.new({user: user, media: media}) }

    before do
      allow_any_instance_of(ExTwitter).to receive(:status).and_return(tweet)
    end

    it 'assigns the specified tweet as @tweet' do
      get :show, {status_id: status_id, photo_id: photo_id}, valid_session
      expect(assigns(:tweet)).to be_truthy
    end

    it 'assigns the specified photo as @photo' do
      get :show, {status_id: status_id, photo_id: photo_id}, valid_session
      expect(assigns(:photo)).to be_truthy
    end
  end

  # describe "GET new" do
  #   it "assigns a new tweet as @tweet" do
  #     get :new, {}, valid_session
  #     expect(assigns(:tweet)).to be_a_new(Tweet)
  #   end
  # end
  #
  # describe "GET edit" do
  #   it "assigns the requested tweet as @tweet" do
  #     tweet = Tweet.create! valid_attributes
  #     get :edit, {:id => tweet.to_param}, valid_session
  #     expect(assigns(:tweet)).to eq(tweet)
  #   end
  # end
  #
  # describe "POST create" do
  #   describe "with valid params" do
  #     it "creates a new Tweet" do
  #       expect {
  #         post :create, {:tweet => valid_attributes}, valid_session
  #       }.to change(Tweet, :count).by(1)
  #     end
  #
  #     it "assigns a newly created tweet as @tweet" do
  #       post :create, {:tweet => valid_attributes}, valid_session
  #       expect(assigns(:tweet)).to be_a(Tweet)
  #       expect(assigns(:tweet)).to be_persisted
  #     end
  #
  #     it "redirects to the created tweet" do
  #       post :create, {:tweet => valid_attributes}, valid_session
  #       expect(response).to redirect_to(Tweet.last)
  #     end
  #   end
  #
  #   describe "with invalid params" do
  #     it "assigns a newly created but unsaved tweet as @tweet" do
  #       post :create, {:tweet => invalid_attributes}, valid_session
  #       expect(assigns(:tweet)).to be_a_new(Tweet)
  #     end
  #
  #     it "re-renders the 'new' template" do
  #       post :create, {:tweet => invalid_attributes}, valid_session
  #       expect(response).to render_template("new")
  #     end
  #   end
  # end
  #
  # describe "PUT update" do
  #   describe "with valid params" do
  #     let(:new_attributes) {
  #       skip("Add a hash of attributes valid for your model")
  #     }
  #
  #     it "updates the requested tweet" do
  #       tweet = Tweet.create! valid_attributes
  #       put :update, {:id => tweet.to_param, :tweet => new_attributes}, valid_session
  #       tweet.reload
  #       skip("Add assertions for updated state")
  #     end
  #
  #     it "assigns the requested tweet as @tweet" do
  #       tweet = Tweet.create! valid_attributes
  #       put :update, {:id => tweet.to_param, :tweet => valid_attributes}, valid_session
  #       expect(assigns(:tweet)).to eq(tweet)
  #     end
  #
  #     it "redirects to the tweet" do
  #       tweet = Tweet.create! valid_attributes
  #       put :update, {:id => tweet.to_param, :tweet => valid_attributes}, valid_session
  #       expect(response).to redirect_to(tweet)
  #     end
  #   end
  #
  #   describe "with invalid params" do
  #     it "assigns the tweet as @tweet" do
  #       tweet = Tweet.create! valid_attributes
  #       put :update, {:id => tweet.to_param, :tweet => invalid_attributes}, valid_session
  #       expect(assigns(:tweet)).to eq(tweet)
  #     end
  #
  #     it "re-renders the 'edit' template" do
  #       tweet = Tweet.create! valid_attributes
  #       put :update, {:id => tweet.to_param, :tweet => invalid_attributes}, valid_session
  #       expect(response).to render_template("edit")
  #     end
  #   end
  # end
  #
  # describe "DELETE destroy" do
  #   it "destroys the requested tweet" do
  #     tweet = Tweet.create! valid_attributes
  #     expect {
  #       delete :destroy, {:id => tweet.to_param}, valid_session
  #     }.to change(Tweet, :count).by(-1)
  #   end
  #
  #   it "redirects to the tweets list" do
  #     tweet = Tweet.create! valid_attributes
  #     delete :destroy, {:id => tweet.to_param}, valid_session
  #     expect(response).to redirect_to(tweets_url)
  #   end
  # end

end
