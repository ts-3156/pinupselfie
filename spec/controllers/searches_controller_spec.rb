require 'rails_helper'

RSpec.describe SearchesController, :type => :controller do

  # This should return the minimal set of attributes required to create a valid
  # Search. As you add validations to Search, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) {
    skip("Add a hash of attributes valid for your model")
  }

  let(:invalid_attributes) {
    skip("Add a hash of attributes invalid for your model")
  }

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # SearchesController. Be sure to keep this updated too.
  let(:valid_session) { {} }

  describe 'GET index' do
    it 'assigns the json file path as @json_path' do
      get :index, {}, valid_session
      expect(assigns(:json_path)).to eq('public/assets/json/cute.json')
    end
  end

  describe "GET show" do
    before do
      allow_any_instance_of(PhotosUpdater).to receive(:run)
    end

    context 'when params[:screen_name] is present' do
      let(:screen_name) { 'ts_3156' }

      before do
        allow_any_instance_of(ExTwitter).to receive(:user_timeline).and_return([])
      end

      it 'assigns the json file path as @json_path' do
        get :show, {screen_name: "@#{screen_name}"}, valid_session
        expect(assigns(:json_path)).to eq("public/assets/json/screen_name/#{screen_name}.json")
      end
    end

    context 'when params[:hash_tag] is present' do
      let(:hashtag) { 'こんにちは' }

      before do
        allow_any_instance_of(ExTwitter).to receive(:search).and_return([])
      end

      it 'assigns the json file path as @json_path' do
        get :show, {hashtag: "##{hashtag}"}, valid_session
        expect(assigns(:json_path)).to eq(URI.encode("public/assets/json/hash_tag/#{URI.encode(hashtag)}.json"))
      end
    end
  end

  # describe "GET new" do
  #   it "assigns a new search as @search" do
  #     get :new, {}, valid_session
  #     expect(assigns(:search)).to be_a_new(Search)
  #   end
  # end
  #
  # describe "GET edit" do
  #   it "assigns the requested search as @search" do
  #     search = Search.create! valid_attributes
  #     get :edit, {:id => search.to_param}, valid_session
  #     expect(assigns(:search)).to eq(search)
  #   end
  # end
  #
  # describe "POST create" do
  #   describe "with valid params" do
  #     it "creates a new Search" do
  #       expect {
  #         post :create, {:search => valid_attributes}, valid_session
  #       }.to change(Search, :count).by(1)
  #     end
  #
  #     it "assigns a newly created search as @search" do
  #       post :create, {:search => valid_attributes}, valid_session
  #       expect(assigns(:search)).to be_a(Search)
  #       expect(assigns(:search)).to be_persisted
  #     end
  #
  #     it "redirects to the created search" do
  #       post :create, {:search => valid_attributes}, valid_session
  #       expect(response).to redirect_to(Search.last)
  #     end
  #   end
  #
  #   describe "with invalid params" do
  #     it "assigns a newly created but unsaved search as @search" do
  #       post :create, {:search => invalid_attributes}, valid_session
  #       expect(assigns(:search)).to be_a_new(Search)
  #     end
  #
  #     it "re-renders the 'new' template" do
  #       post :create, {:search => invalid_attributes}, valid_session
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
  #     it "updates the requested search" do
  #       search = Search.create! valid_attributes
  #       put :update, {:id => search.to_param, :search => new_attributes}, valid_session
  #       search.reload
  #       skip("Add assertions for updated state")
  #     end
  #
  #     it "assigns the requested search as @search" do
  #       search = Search.create! valid_attributes
  #       put :update, {:id => search.to_param, :search => valid_attributes}, valid_session
  #       expect(assigns(:search)).to eq(search)
  #     end
  #
  #     it "redirects to the search" do
  #       search = Search.create! valid_attributes
  #       put :update, {:id => search.to_param, :search => valid_attributes}, valid_session
  #       expect(response).to redirect_to(search)
  #     end
  #   end
  #
  #   describe "with invalid params" do
  #     it "assigns the search as @search" do
  #       search = Search.create! valid_attributes
  #       put :update, {:id => search.to_param, :search => invalid_attributes}, valid_session
  #       expect(assigns(:search)).to eq(search)
  #     end
  #
  #     it "re-renders the 'edit' template" do
  #       search = Search.create! valid_attributes
  #       put :update, {:id => search.to_param, :search => invalid_attributes}, valid_session
  #       expect(response).to render_template("edit")
  #     end
  #   end
  # end
  #
  # describe "DELETE destroy" do
  #   it "destroys the requested search" do
  #     search = Search.create! valid_attributes
  #     expect {
  #       delete :destroy, {:id => search.to_param}, valid_session
  #     }.to change(Search, :count).by(-1)
  #   end
  #
  #   it "redirects to the searches list" do
  #     search = Search.create! valid_attributes
  #     delete :destroy, {:id => search.to_param}, valid_session
  #     expect(response).to redirect_to(searches_url)
  #   end
  # end

end
